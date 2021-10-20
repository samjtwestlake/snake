// Don't delete these lines



window.changeDirection = ({
    direction,
    head,
    food,
    tail,
    width,
    height,
}) => {  
    const DIR_VECS = {
        left: [-1, 0],
        right: [1, 0],
        up: [0, 1],
        down: [0, -1]
    }
    
    const OPP_DIRS = {
        right: 'left',
        left: 'right',
        up: 'down',
        down: 'up',
    }
    
    const BITMAP_LABELS = {
        EMPTY: 0,
        TAIL: 1,
        HEAD: 3,
        FOOD: 5,
    }

    function deriveBitmap(tail, food, width, height) {
        let bitmap = new Array(width)
        for (let x = 0; x < width; x++) {
            bitmap[x] = new Array(height)
            for (let y = 0; y < height; y++) {
                bitmap[x][y] = BITMAP_LABELS.EMPTY
            }
        }
        bitmap[food.x][food.y] = BITMAP_LABELS.FOOD
        for (let seg of tail) {
            bitmap[seg.x][seg.y] = BITMAP_LABELS.TAIL
        }
        if (tail.length)
            bitmap[prevHead.x][prevHead.y] = BITMAP_LABELS.TAIL
        
        return bitmap
    }
    
    function mod(x, n) {
        return ((x % n) + n) % n
    }
    
    function calcNewPos(pos, direction) {
        return {
            x: mod(pos.x + DIR_VECS[direction][0], X),
            y: mod(pos.y + DIR_VECS[direction][1], Y)
        }
    }
    
    function recurseForEmptySpace(bitmap, pos, length, space=0, recurseHash = {}) {
        recurseHash[JSON.stringify(pos)] = true
        let { x, y } = pos
        if (bitmap[x][y] == BITMAP_LABELS.TAIL) {
            return space
        } else if (space > length) {
            return space 
        } else {
            bitmap[x][y] = BITMAP_LABELS.TAIL
            space++
        }
    
        let newSpace = space
        for (let dir in DIR_VECS) {
            let newPos = calcNewPos(pos, dir)
            if (JSON.stringify(newPos) in recurseHash)
                continue
            if (bitmap[newPos.x][newPos.y] != BITMAP_LABELS.TAIL) {
                newSpace = recurseForEmptySpace(copyBitmap(bitmap), newPos, length, space, recurseHash)
                if (newSpace > length) {
                    return newSpace
                }
            }
        }
        return space
    }
    
    function calcPossDirections(bitmap, direction, head, tail, ignoreLoop=false) {
        let possDirs = []
        let newBitmap = copyBitmap(bitmap)
        let newHead = calcNewPos(head, direction)
        newBitmap[head.x][head.y] = BITMAP_LABELS.TAIL
        newBitmap[newHead.x][newHead.y] = BITMAP_LABELS.TAIL
        let length = tail.length + 1
    
        for (let dir in DIR_VECS) {
            if (dir == OPP_DIRS[direction])
                continue
            let emptySpace = recurseForEmptySpace(copyBitmap(newBitmap), calcNewPos(newHead, dir), length)
            if (emptySpace == 0) {
                // console.log(`Direction ${dir} avoided, obstacle in path`)
            } else if (!ignoreLoop && emptySpace < length) {
                console.log(`Direction ${dir} avoided, ${emptySpace} cells of space insufficient`)
            } else {
                possDirs.push(dir)
            }
        }
        return possDirs
    }
    
    function directionForDirectPath(bitmap, direction, head, tail, food, pathLength=0) {
        let newHead = calcNewPos(head, direction)
        let possDirs = calcPossDirections(bitmap, direction, head, tail)
    
        let [x1, y1] = [newHead.x, newHead.y]
        let [x2, y2] = [food.x, food.y]
        let [dx, dy] = [x2-x1, y2-y1]
    
        if (dx == 0 && dy == 0)
            return possDirs[0]
    
        let cands = []
        let dirs, onLine
        if (dx == 0) {
            dirs = ['up', 'down']
            onLine = true
        } else if (dy == 0) {
            dirs = ['right', 'left']
            onLine = true
        } else {
            dirs = Object.keys(DIR_VECS)
            onLine = false
        }
    
        for (let dir of dirs) {
            if (!possDirs.includes(dir))
                continue
            n = 0
            let [xStep, yStep] = [DIR_VECS[dir][0], DIR_VECS[dir][1]]
            let clear = true
            let [x, y] = [x1, y1]
            while ((x != x2 | x1 == x2) && (y != y2 | y1 == y2)) {
                if (bitmap[x][y] == BITMAP_LABELS.TAIL)
                    clear = false
                x = mod(x+xStep, X)
                y = mod(y+yStep, Y)
                n++
            }
            if (clear) {
                if (onLine) {
                    cands.push([dir, pathLength+n])
                } else {
                    [x, y] = [mod(x - xStep, X), mod(y - yStep, Y)]
                    let dir2 = directionForDirectPath(bitmap, dir, {x: x, y: y}, tail, food, n)
                    if (dir2)
                        cands.push([dir, pathLength+n])
                }
            }
        }
    
        if (cands.length) {
            cands.sort(function(a, b) {
                return a[1] - b[1]
            })
            n = cands[0][1]
            return cands[0][0]
        }
        return false
    }
    
    function copyBitmap(bitmap) {
        return bitmap.map(function(col) {
            return col.slice()
        })
    }
    
    function directionForWrappingPath(bitmap, direction, head, tail, ignoreLoop=false) {
        let newHead = calcNewPos(head, direction)
        let newBitmap = copyBitmap(bitmap)
        newBitmap[head.x][head.y] = BITMAP_LABELS.TAIL
        // newBitmap[newHead.x][newHead.y] = BITMAP_LABELS.TAIL
        let possDirs = calcPossDirections(bitmap, direction, head, tail, ignoreLoop)
        
        for (let dir of possDirs) {
            let newPos = calcNewPos(newHead, dir)
    
            for (let dir2 in DIR_VECS) {
                if (dir2 == OPP_DIRS[dir])
                    continue
                let neighbourPos = calcNewPos(newPos, dir2)
                
                if (bitmap[neighbourPos.x][neighbourPos.y] == BITMAP_LABELS.TAIL) {
                    return dir
                }
            }
        }
        return false
    }
    
    function straightDirection(bitmap, direction, head, tail) {
        let ignoreLoop = true
        let possDirs = calcPossDirections(bitmap, direction, head, tail, ignoreLoop)
        if (possDirs.includes(direction))
            return direction
        return false
    }
    
    function perpDirection(bitmap, direction, head, tail) {
        let ignoreLoop = true
        let possDirs = calcPossDirections(bitmap, direction, head, tail, ignoreLoop)
        if (direction == 'left' | direction == 'right') {
            for (let dir of ['up', 'down']) {
                if (possDirs.includes(dir))
                    return dir
            }
        } else if (direction == 'up' | direction == 'down') {
            for (let dir of ['right', 'left']) {
                if (possDirs.includes(dir))
                    return dir
            }
        }
        return false
    }
    
    function calcNewDirection(state, bitmap) {
        let { direction, head, food, tail, width, height } = state
        
        console.log("Calculating direction...")
        let newDirection = directionForDirectPath(bitmap, direction, head, tail, food)
    
        if (newDirection == false) {
            newDirection = directionForWrappingPath(bitmap, direction, head, tail)
    
            if (newDirection == false) {
                let ignoreLoop = true
                newDirection = directionForWrappingPath(bitmap, direction, head, tail, ignoreLoop)
                if (newDirection == false) {
                    newDirection = straightDirection(bitmap, direction, head, tail)
                    if (newDirection == false) {
                        newDirection = perpDirection(bitmap, direction, head, tail)
                        if (newDirection == false) {
                            console.log("ERROR: No direction found")
                        } else {
                            console.log("Perpendicular direction chosen")
                        }
                    } else {
                        console.log("Straight direction chosen")
                    }
                } else {
                    console.log("Wrapping path chosen ignoring loops")
                }
            } else {
                console.log("Wrapping path found")
            }
        } else {
            console.log("Direct path found")
        }
        console.log(`newDirection: ${newDirection}`)
        return newDirection
    }

    function init(width, height, head) {
        window.X = width
        window.Y = height
        window.prevHead = head
    }

    let state = {
        direction: direction,
        head: head,
        food: food,
        tail: tail,
        width: width,
        height: height,
    }
    console.log(state)

    var n
    if (tail.length == 0) {
        init(width, height, head)
    }

    X = width
    Y = height

    if (head.x + DIR_VECS[direction][0] == food.x && head.y + DIR_VECS[direction][1] == food.y) {
        console.log('Food eaten!')
    }
    let bitmap = deriveBitmap(tail, food, width, height)
    console.log(bitmap)

    console.time('directionCalc')
    let newDirection = calcNewDirection(state, bitmap)
    console.timeEnd('directionCalc')

    window.prevHead = head

    return newDirection
}
// Don't delete these lines
console.log("TESTING TESTING")

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
    down: 'left',
}

const bitmapLabels = {
    EMPTY: 0,
    TAIL: 1,
    HEAD: 3,
    FOOD: 5,
}

var X
var Y

function deriveBitmap(head, tail, food, width, height) {
    let bitmap = new Array(width)
    for (let x = 0; x < width; x++) {
        bitmap[x] = new Array(height)
        for (let y = 0; y < height; y++) {
            bitmap[x][y] = bitmapLabels.EMPTY
        }
    }
    bitmap[food.x][food.y] = bitmapLabels.FOOD
    for (let seg of tail) {
        bitmap[seg.x][seg.y] = bitmapLabels.TAIL
    }
    // bitmap[head.x][head.y] = bitmapLabels.HEAD
    
    return bitmap
}

function mod(x, n) {
    return ((x % n) + n) % n
}

function calcNewPos(head, direction) {
    return {
        x: mod(head.x + DIR_VECS[direction][0], X),
        y: mod(head.y + DIR_VECS[direction][1], Y)
    }
}

function calcPossDirections(bitmap, direction, head) {
    let possDirs = []
    for (let dir in DIR_VECS) {
        if (dir == OPP_DIRS[direction])
            continue
        let newPos = calcNewPos(head, dir)
        if (bitmap[newPos.x][newPos.y] != bitmapLabels.TAIL)
            possDirs.push(dir)
    }
    return possDirs
}

function directionForDirectPath(bitmap, direction, head, food) {
    let newHead = calcNewPos(head, direction)
    let possDirs = calcPossDirections(bitmap, direction, newHead)

    let [x1, y1] = [newHead.x, newHead.y]
    let [x2, y2] = [food.x, food.y]
    let [dx, dy] = [x2-x1, y2-y1]

    if (dx == 0 && dy == 0)
        return possDirs[0]

    if (dx == 0) {
        let dirs = ['up', 'down']
        let x = x1
        for (let dir of dirs) {
            if (!possDirs.includes(dir))
                continue
            let yStep = DIR_VECS[dir][1]
            let clear = true
            let y = y1+yStep
            while(y != y2) {
                if (bitmap[x][y] == bitmapLabels.TAIL)
                    clear = false
                y = mod(y+yStep, Y)
            }
            if (clear)
                return dir
        }
    } else if (dy == 0) {
        let dirs = ['right', 'left']
        let y = y1
        for (let dir of dirs) {
            if (!possDirs.includes(dir))
                continue
            let xStep = DIR_VECS[dir][0]
            let clear = true
            let x = x1+xStep
            while(x != x2) {
                if (bitmap[x][y] == bitmapLabels.TAIL)
                    clear = false
                x = mod(x+xStep, X)
            }
            if (clear)
                return dir
        }
    } 
    else {
        for (let dir in DIR_VECS) {
            if (!possDirs.includes(dir))
                continue
            let [xStep, yStep] = [DIR_VECS[dir][0], DIR_VECS[dir][1]]
            let clear = true
            let [x, y] = [x1+xStep, y1+yStep]
            while (x != x2 && y != y2) {
                if (bitmap[x][y] == bitmapLabels.TAIL)
                    clear = false
                x = mod(x+xStep, X)
                y = mod(y+yStep, Y)
            }
            if (clear)
                return dir
                // let dir2 = directionForDirectPath(bitmap, dir, {x: x, y: y}, food)
                // if (dir2)
                //     return dir
        }
    }
    return false
}

function copyBitmap(bitmap) {
    return bitmap.map(function(col) {
        return col.slice()
    })
}

function recurseForEmptySpace(bitmap, pos, length, space=0) {
    let { x, y } = pos
    if (bitmap[x][y] == bitmapLabels.TAIL) {
        console.log("ERROR: empty space recursion located on tail")
        return space
    } else if (space > length) {
        return space 
    } else {
        bitmap[x][y] = bitmapLabels.TAIL
        space++
    }

    for (let dir in DIR_VECS) {
        let newPos = calcNewPos(pos, dir)
        if (bitmap[newPos.x][newPos.y] == bitmapLabels.EMPTY) {
            return recurseForEmptySpace(bitmap, newPos, length, space)
        }
    }
    return space
}

function directionForWrappingPath(bitmap, direction, head, tail) {
    let newHead = calcNewPos(head, direction)
    let newBitmap = copyBitmap(bitmap)
    newBitmap[head.x][head.y] = bitmapLabels.TAIL
    newBitmap[newHead.x][newHead.y] = bitmapLabels.TAIL
    let possDirs = calcPossDirections(bitmap, direction, newHead)
    
    for (let dir of possDirs) {
        let newPos = calcNewPos(newHead, dir)
        let length = tail.length + 1
        let emptySpace = recurseForEmptySpace(copyBitmap(newBitmap), newPos, length)
        if (emptySpace < length) {
            console.log(`Direction ${dir} avoided, ${emptySpace} cells of space insufficient`)
            continue
        }

        for (let dir2 in DIR_VECS) {
            let neighbourPos = calcNewPos(newPos, dir2)
            if (dir2 == OPP_DIRS[dir])
                continue
            if (bitmap[neighbourPos.x][neighbourPos.y] == bitmapLabels.TAIL) {
                console.log({
                    possDirs: possDirs,
                    dir: dir,
                    newPos: newPos,
                    neighbourPos: neighbourPos,
                })
                return dir
            }
        }
    }
    return false
}

function perpDirection(bitmap, direction, head) {
    let possDirs = calcPossDirections(bitmap, direction, head)
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
    return null
}

function calcNewDirection(state, bitmap) {
    let { direction, head, food, tail, width, height } = state
    
    console.log("Calculating direction...")
    let newDirection = directionForDirectPath(bitmap, direction, head, food)

    if (newDirection == false) {
        newDirection = directionForWrappingPath(bitmap, direction, head, tail)

        if (newDirection == false) {
            newDirection = perpDirection(bitmap, direction, head)
            if (newDirection == null) {
                console.log("ERROR: No direction found")
            } else {
                console.log("Perpendicular direction chosen")
            }
        } else {
            console.log("Wrapping path found")
        }
    } else {
        console.log("Direct path found")
    }
    
    return newDirection
}

window.changeDirection = ({
    direction,
    head,
    food,
    tail,
    width,
    height,
}) => {  
    let state = {
        direction: direction,
        head: head,
        food: food,
        tail: tail,
        width: width,
        height: height,
    }
    console.log(state)

    X = width
    Y = height

    if (head.x + DIR_VECS[direction][0] == food.x && head.y + DIR_VECS[direction][1] == food.y) {
        console.log('Food eaten!')
    }
    let bitmap = deriveBitmap(head, tail, food, width, height)
    console.log(bitmap)

    console.time('directionCalc')
    let newDirection = calcNewDirection(state, bitmap)
    console.timeEnd('directionCalc')

    let debug = {
        bitmap: bitmap
    }
    
    let info = {
        state: state,
        debug: debug
    }

    let textarea = document.getElementsByTagName('textarea')[0]
    textarea.dataset.info = JSON.stringify(info)
    textarea.dataset.infoRead = false

    return newDirection
}
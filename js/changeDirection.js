// Don't delete these lines
console.log("TESTING TESTING")

const DIR_VECS = {
    left: [-1, 0],
    right: [1, 0],
    up: [0, 1],
    down: [0, -1]
}
const X = 40
const Y = 40
const bitmapLabels = {
    EMPTY: 0,
    TAIL: 1,
    NEIGHBOUR: 2,
    HEAD: 3,
    FOOD: 5,
}
var foodIsNeighbour = false
const MAX_RECURSION_DEPTH = 100

function deriveBitmap(head, tail, food, width, height) {
    let bitmap = new Array(width)
    for (let x = 0; x < width; x++) {
        bitmap[x] = new Array(height)
        for (let y = 0; y < height; y++) {
            bitmap[x][y] = bitmapLabels.EMPTY
        }
    }
    for (let seg of tail) {
        bitmap[seg.x][seg.y] = bitmapLabels.TAIL
        for (let dir in DIR_VECS) {
            let x = mod(seg.x + DIR_VECS[dir][0], X)
            let y = mod(seg.y + DIR_VECS[dir][1], Y)
            bitmap[x][y] = bitmapLabels.NEIGHBOUR
        }
    }
    // bitmap[head.x][head.y] = bitmapLabels.HEAD
    if (bitmap[food.x][food.y] == bitmapLabels.NEIGHBOUR) {
        foodIsNeighbour = true
    } else {
        foodIsNeighbour = false
    }
    bitmap[food.x][food.y] = bitmapLabels.FOOD
    return bitmap
}

function mod(x, n) {
    return ((x % n) + n) % n
}

function rankDirections(possDirs, direction, head, food) {
    let diffs = {
        left: mod(-(food.x - head.x), X),
        right: mod(food.x - head.x, X),
        up: mod(food.y - head.y, Y),
        down: mod(-(food.y - head.y), Y),
    }

    for (let dir in diffs) {
        if (diffs[dir] == 0) {
            diffs[dir] = X
        }
    }
    // if (Object.values(diffs).every(function(diff) { diff == X })) {
    //     possDirs = [direction]
    // }

    let sortable = []
    for (let dir of possDirs) {
        sortable.push([dir, diffs[dir]])
    }
    sortable.sort(function(a, b) {
        return Math.abs(a[1]) - Math.abs(b[1])
    })

    let rankedDirs = sortable.map(function(x) {
        return x[0]
    })

    return rankedDirs
}

function isValidPos(bitmap, nextPos) {
    if (bitmap[nextPos.x][nextPos.y] == bitmapLabels.TAIL)
        return false
    if (bitmap[nextPos.x][nextPos.y] == bitmapLabels.NEIGHBOUR)
        return false
    return true
}

function calcSafeDirs(bitmap, head, direction) {
    let possDirs = []
    let oppDirections = {
        left: 'right',
        right: 'left',
        down: 'up',
        up: 'down',
    }

    for (let dir in DIR_VECS) {
        if (dir == oppDirections[direction]) {
            continue
        }
        let nextPos = {
            x: mod(head.x + DIR_VECS[dir][0], X),
            y: mod(head.y + DIR_VECS[dir][1], Y)
        }
        
        if (bitmap[nextPos.x][nextPos.y] == bitmapLabels.TAIL) {
            possDirs.push(dir)
        }
    }
    return possDirs
}

function calcPossDirections(bitmap, head, direction) {
    let possDirs = []
    let oppDirections = {
        left: 'right',
        right: 'left',
        down: 'up',
        up: 'down',
    }

    for (let dir in DIR_VECS) {
        if (dir == oppDirections[direction]) {
            continue
        }
        let nextPos = {
            x: mod(head.x + DIR_VECS[dir][0], X),
            y: mod(head.y + DIR_VECS[dir][1], Y)
        }
        
        if (isValidPos(bitmap, nextPos)) {
            possDirs.push(dir)
        }
    }
    return possDirs
}

function calcNewHead(head, direction) {
    return {
        x: mod(head.x + DIR_VECS[direction][0], X),
        y: mod(head.y + DIR_VECS[direction][1], Y)
    }
}

function recurseForDirection(bitmap, direction, head, tail, food, depth=0) {
    let newHead = calcNewHead(head, direction)
    let newTail = []
    let newBitmap = bitmap.map(function(arr) {
        return arr.slice()
    })
    if (tail.length) {
        newBitmap[head.x][head.y] = 1
        let endSeg = tail[0]
        newBitmap[endSeg.x][endSeg.y] = 0
        newTail = tail.slice(1,)
        newTail.push(head)
    }

    
    let possDirs = calcPossDirections(newBitmap, newHead, direction)

    if (bitmap[newHead.x][newHead.y] == bitmapLabels.FOOD) {
        console.log('Food eaten! Returning...')
        return possDirs[0]
    } else if (foodIsNeighbour) {
        console.log('Food inaccessible. Random direction selected. Returning...')
        return possDirs[0]
    } else if (depth > MAX_RECURSION_DEPTH) {
        console.log('Max recursion level reached. Returning...')
        let safeDirs = calcSafeDirs(newBitmap, newHead, direction)
        return safeDirs[0]
    }

    let rankedDirs = rankDirections(possDirs, direction, newHead, food)

    for (let dir of rankedDirs) {
        console.log({
            newBitmap: newBitmap,
            dir: dir,
            newHead: newHead,
            newTail: newTail,
            food: food,
        })
        let isPath = recurseForDirection(newBitmap, dir, newHead, newTail, food, depth+1)
        if (isPath) {
            return dir
        }
    }
    return false
}

function calcNewDirection(state, bitmap) {
    let { direction, head, food, tail, width, height } = state
    
    console.log("Calculating direction...")
    let newDirection = recurseForDirection(bitmap, direction, head, tail, food)
    if (newDirection == false) {
        newDirection = calcPossDirections(bitmap, calcNewHead(head, direction), direction)[0]
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

    if (head.x + DIR_VECS[direction][0] == food.x && head.y + DIR_VECS[direction][1] == food.y) {
        console.log('Food eaten!')
    }
    let bitmap = deriveBitmap(head, tail, food, width, height)

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
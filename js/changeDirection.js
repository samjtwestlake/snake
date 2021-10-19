// Don't delete these lines
console.log("TESTING TESTING")
function deriveBitmap(head, tail, food, width, height) {
    let bitmap = new Array(width)
    for (let x = 0; x < width; x++) {
        bitmap[x] = new Array(height)
        for (let y = 0; y < height; y++) {
            bitmap[x][y] = 0
        }
    }
    for (let seg of tail) {
        bitmap[seg.x][seg.y] = 1
    }
    // bitmap[head.x][head.y] = 2
    bitmap[food.x][food.y] = 3
    return bitmap
}

// function chooseXDirection(dx) {
//     let newDirection
//     if (dx > 0) {
//         newDirection = "right"
//     } else {
//         newDirection = "left"
//     }
//     return newDirection
// }

// function chooseYDirection(dy) {
//     let newDirection
//     if (dy > 0) {
//         newDirection = "up"
//     } else {
//         newDirection = "down"
//     }
//     return newDirection
// }

// function calcNewDirection(state, bitmap) {
//     let { direction, head, food, tail, width, height } = state
//     let dx = food.x - head.x
//     let dy = food.y - head.y
//     let newDirection = null

//     if (Math.abs(dx) < Math.abs(dy)) {
//         newDirection = chooseXDirection(dx)
//     } else {
//         newDirection = chooseYDirection(dy)
//     }

//     if (direction == "right" && dx == 1) {
//         newDirection = chooseYDirection(dy)
//     } else if (direction == "left" && dx == -1) {
//         newDirection = chooseYDirection(dy)
//     } else if (direction == "up" && dy == 1) {
//         newDirection = chooseXDirection(dx)
//     } else if (direction == "down" && dy == -1) {
//         newDirection = chooseXDirection(dx)
//     }

//     if ((direction == "right" | direction == "left") && dy == 0) {
//         newDirection = direction
//     } else if ((direction == "up" | direction == "down") && dx == 0) {
//         newDirection = direction
//     }

//     return newDirection
// }

function mod(x, n) {
    return ((x % n) + n) % n
}

function rankDirections(head, food, X, Y) {
    let diffs = {
        left: mod(-(food.x - head.x), X),
        right: mod(food.x - head.x, X),
        up: mod(food.y - head.y, Y),
        down: mod(-(food.y - head.y), Y),
    }
    let sortable = []
    for (let dir in diffs) {
        sortable.push([dir, diffs[dir]])
    }
    sortable.sort(function(a, b) {
        return Math.abs(a[1]) - Math.abs(b[1])
    })


    let inds = []
    for (let i = 0; i < sortable.length; i++) {
        let x = sortable[i]
        if (x[1] == 1 | x[1] == X - 1) {
            inds.push(i)
        }
    }
    let end = []
    for (let i of inds.reverse()) {
        end.unshift(sortable[i])
        sortable.splice(i, 1)
    }
    sortable = sortable.concat(end)

    inds = []
    for (let i = 0; i < sortable.length; i++) {
        let x = sortable[i]
        if (x[1] == 0) {
            inds.push(i)
        }
    }
    end = []
    for (let i of inds.reverse()) {
        end.unshift(sortable[i])
        sortable.splice(i, 1)
    }
    sortable = sortable.concat(end)

    return sortable.map(function(x) {
        return x[0]
    })
}

function recurseForDirection(bitmap, head, tail, food) {
    if (bitmap[head.x][head.y] == 1) {
        return false
    } else if (bitmap[head.x][head.y] == 3) {
        return true
    }

    let X = bitmap.length
    let Y = bitmap[0].length

    let vecs = {
        left: [-1, 0],
        right: [1, 0],
        up: [0, 1],
        down: [0, -1],
    }

    let rankedDirs = rankDirections(head, food, X, Y)
    for (let dir of rankedDirs) {
        let vec = vecs[dir]
        let newHead = { 
            x: mod(head.x + vec[0], X),
            y: mod(head.y + vec[1], Y),
        }
        let newBitmap = bitmap.map(function(arr) {
            return arr.slice()
        })
        let newTail = tail.slice(1,)
        newTail.push(head)
        
        // newBitmap[head.x][head.y] = 0
        // newBitmap[newHead.x][newHead.y] = 2
        if (tail.length) {
            newBitmap[head.x][head.y] = 1
            let endSeg = tail[0]
            newBitmap[endSeg.x][endSeg.y] = 0
        }
        console.log({
            newBitmap: newBitmap,
            newHead: newHead,
            tail: tail,
            food: food,
        })
        let isPath = recurseForDirection(newBitmap, newHead, newTail, food)
        if (isPath) {
            return dir
        }
    }
    return false
}

function calcNewDirection(state, bitmap) {
    let { direction, head, food, tail, width, height } = state
    
    console.log("Calculating direction...")
    let newDirection = recurseForDirection(bitmap, head, tail, food)

    return newDirection
}

function myChangeDirection(state) {
    let { direction, head, food, tail, width, height } = state
    let bitmap = deriveBitmap(head, tail, food, width, height)
    let newDirection = calcNewDirection(state, bitmap)
}
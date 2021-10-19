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

    newDirection = myChangeDirection(state)

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
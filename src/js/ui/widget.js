import {Options} from "../util/options"
import {Queue} from "../util/queue"
import {DOMList, Matcher, SimpleDOMParser} from "../util/dom"
import {UploadItem} from "./upload"
import {DeleteItem} from "./delete"

/**
 * Why bother instantiating a Matcher when you can call the short convenience function
 * So instead of new Matcher().css(..) it's m().css(..)
 */
function m(bubble) {
    return new Matcher(bubble)
}

/**
 * Instead of instantiating a DOMList every time we can use this this tiny convenience function
 * So instead of new DOMList(..) it's just up(..)
 */
function up(arg) {
    return new DOMList(arg)
}

/**
 * The Widget class is the controller between the DOM elements (and user actions) and the backend.
 */
export class Widget {

    constructor(ele, opts) {
        this._ele = up(ele)
        this._opts = new Options(opts, ele)
        this._size = 0
        this._queue = new Queue(this._next, {
            delay: 200
        })
        this._parser = new SimpleDOMParser()
        this._listeners = {}
        
        this._opts.get("deletable", "max", "allowed_types", "types", (deletable, max, allowedTypes, types) => {
            this._deletable = deletable !== false
            this._max = max
            
            this._allowedTypes = []
            if (typeof allowedTypes === "string") {
                allowedTypes = allowedTypes.split(",")
            }
            if (Array.isArray(allowedTypes)) {
                allowedTypes.forEach(type => {
                    if (Array.isArray(types[type])) {
                        types[type].forEach(t => {
                            this._allowedTypes.push(t.toLowerCase())
                        })
                    } else {
                        this._allowedTypes.push(type.toLowerCase())
                    }
                })
            }
            
            this._types
            this._init()
        })
    }

    /**
     * Sets up the DOM.
     * Creates and appends an INPUT of type file for the user to be able to pick files.
     * Adjusts any current IMG elements in the containing element.
     * Registers appropriate listeners.
     */
    _init() {
        this._ele.addClass("uploadjs")

        this._picker = up("input").attr({"type": "file", "multiple": "multiple"}).appendTo(this._ele).on("change", this._picked.bind(this))

        this._ele.find("img").each(image => {
            let img = up(image)
            let id = img.data("uploadImageId")
            if (!this._max || this._size < this._max) {
                let item = this._parser.parse(this._opts.get("template.item"))
                item.find("img").attr("src", img.attr("src"))
                if (this._deletable && typeof id !== "undefined") {
                    this._parser.parse(this._opts.get("template.actions")).appendTo(item)
                } else {
                    item.addClass("static")
                }
                item.appendTo(this._ele)
                this._size++
            }
            img.remove()
        })

        this._add = this._parser.parse(this._opts.get("template.add")).appendTo(this._ele)

        this._picker = this._picker.items[0]
        this._ele.on("click", m(true).css("item", "new"), this._picker.click.bind(this._picker))
        this._ele.on("click", m(true).css("del"), this._delete.bind(this))
        
        let reduceAndUpdate = () => {
            this._size--
            this._update()
        }
        this._addListener("upload.failed", reduceAndUpdate)
        this._addListener("delete.done", reduceAndUpdate)
        
        this._update()
    }
    
    /**
     * Registers a listener with this Widget
     * 
     * @param on The event to listen for
     * @param handler The handler function that gets called
     */
    _addListener(on, handler) {
        if (typeof handler === "function") {
            let listeners = this._listeners[on]
            if (!listeners) {
                listeners = this._listeners[on] = []
            }
            listeners.push(handler)
        }
    }

    /**
     * Fired when the user has selected files from the file selection.
     * Adds DOM elements to the containing elements in an uploading state
     * Adds upload to the queue
     */
    _picked() {
        let files = this._picker.files
        for (let x = 0; x < files.length; x++) {
            if ((!this._max || this._size < this._max) && this._typeAllowed(files[x])) {
                let item = this._parser.parse(this._opts.get("template.item")).addClass("uploading")
                this._parser.parse(this._opts.get("template.uploading")).appendTo(item)
                
                let reader = new FileReader()
                reader.onload = e => {
                    item.find("img").attr("src", e.target.result)
                }
                reader.readAsDataURL(files[x])
                item.before(this._add)
                
                this._size++
                this._update()
                this._queue.offer(new UploadItem(item, files[x], this, this._listeners))
            }
        }
        
        this._picker.value = ""
    }
    
    /**
     * Returns true if the passed file is an allowed type
     */
    _typeAllowed(file) {
        return this._allowedTypes.indexOf(file.type) >= 0
    }

    /**
     * Fired when the user has clicked the delete action from the actions bar
     * Sets the DOM element into a removing state
     * Adds deletion to the queue
     */
    _delete(e) {
        let item = up(e.target).parent(m().css("item")).addClass("removing")
        this._parser.parse(this._opts.get("template.deleting")).appendTo(item)
        
        this._queue.offer(new DeleteItem(item, this, this._listeners))
    }
    
    /**
     * Triggered from the queue to handle the next item
     */
    _next(item, done) {
        item.run(done)
    }
    
    /**
     * Adjusts the visibility of the "add" action based on the max option and the current size
     */
    _update() {
        if (this._max) {
            if (this._size < this._max) {
                this._add.removeClass("hide")
            } else {
                this._add.addClass("hide")
            }
        }
    }
}
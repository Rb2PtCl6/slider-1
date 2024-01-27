export class net{
    static readJson(url){
        var js_object = []
        fetch(url)
            .then(function(response){
                return response.json()
            }).then(function(json){
                for (var i in json){
                    js_object[i] = json[i]
                }
            })
        //console.log(js_object)
        return js_object
    }
    static downloadImage(id, url){
        console.log(url)
        var downImage = new Image
        downImage.onload = function(){ 
            viewer.removeLoading(`page${id}`)
            document.querySelector(`#page${id} img`).src = this.src
        }
        downImage.src = url
    }
}
export default class viewer{
    #data = []
    #pointer = {}
    #active_slide = localStorage.getItem("test_active_slide") | 1
    #max_slide = 1
    constructor(pointer, images){
        this.#pointer = pointer
        this.#max_slide = images.length
        //this.#validate_active_slide()
        console.log(this.#max_slide)
        //console.log(tmp1)
        for (var i = 0; i < this.#max_slide; i++){
            this.#data[i] = {id:i, url: images[i], is_loaded: false}
        }
        console.log(this.#data)
        document.getElementById(this.#pointer.header.this_num_id).textContent = this.#active_slide
        document.getElementById(this.#pointer.header.max_num_id).textContent = this.#max_slide
        this.fillViewer()
        this.changeHandler(this.#pointer.controls.prew_id, this.#pointer.controls.next_id)
    }
    /* пофиксить проблему с индексими больше размера массива + 1 и с индексами меньше нуля
    /*#validate_active_slide(){
        var tmp = localStorage.getItem("test_active_slide") || 1
        if (tmp > this.#max_slide){
            this.#active_slide = this.#max_slide
        } else if (tmp < 0){
            this.#active_slide = 0
        }
        this.#active_slide = tmp
    }*/
    fillViewer(){
        console.log(this.#pointer.reader_id)
        for (var i = 0; i < this.#max_slide; i++){
            this.createRawBox(document.getElementById(this.#pointer.reader_id), `page${i+1}`)
        }
        document.getElementById(`page${this.#active_slide}`).classList.replace("hidden","visible")
        this.load_first()
    }
    load_first(){
        //console.log(this.#data[this.#active_slide].url)
        net.downloadImage(this.#active_slide,this.#data[this.#active_slide-1].url)
    }
    /**
     * @param {HTMLDivElement} where_element
     */
    createRawBox(where_element, id){
        var elem = document.createElement("div")
        elem.id = id
        elem.classList.add("page")
        elem.classList.add("loading")
        elem.classList.add("hidden")
        elem.innerHTML = `<img class='page_img'></img>`
        where_element.append(elem)
    }
    // operations with numbers
    get getCurrentNumber(){ return this.#active_slide}
    /**
     * @param {number} num
     */
    setCurrentNumber(num){
        this.#active_slide = num
        localStorage.setItem("test_active_slide",num)
        document.getElementById(this.#pointer.header.this_num_id).textContent = this.#active_slide
    }
    // block's changers
    nextImage(){
        //console.log(this.#data)
        console.log("next")
        var current = this.getCurrentNumber
        var this_id = `page${current}`
        var next_id = `page${current+1}`
        if (current != this.#max_slide){
            this.hideBlock(this_id)
            this.showBlock(next_id)
            this.setCurrentNumber(current+1)
            if (!this.#data[this.#active_slide-1].is_loaded){
                //console.log("open next")
                net.downloadImage(this.#active_slide,this.#data[this.#active_slide-1].url)
                this.#data[this.#active_slide-1].is_loaded = true
            }
        }
    }
    prevImage(){
        console.log("prew")
        var current = this.getCurrentNumber
        var this_id = `page${current}`
        var prew_id = `page${current-1}`
        if (current - 1 != 0){
            this.hideBlock(this_id)
            this.showBlock(prew_id)
            this.setCurrentNumber(current-1)
            if (!this.#data[this.#active_slide-1].is_loaded){
                net.downloadImage(this.#active_slide,this.#data[this.#active_slide-1].url)
                this.#data[this.#active_slide-1].is_loaded = true
            }
        }
    }
    // hide/shiw bloks
    showBlock(id){
        document.getElementById(id).classList.replace("hidden","visible")
    }
    hideBlock(id){
        document.getElementById(id).classList.replace("visible","hidden")
    }
    // remove loading icon
    static removeLoading(id){
        document.getElementById(id).classList.remove("loading")
    }
    // event handlers
    changeHandler(prew_arrow_element, next_arrow_element){
        var _this = this
        document.onkeydown = function(e){
            if (e.key == "ArrowLeft"){
                (function(){
                    _this.prevImage()
                })()
            } else if (e.key == "ArrowRight"){
                (function(){
                    _this.nextImage()
                })()
            }
        }
        document.getElementById(prew_arrow_element).addEventListener("click",function(){
            _this.prevImage()
        })
        document.getElementById(next_arrow_element).addEventListener("click",function(){
            _this.nextImage()
        })
    }
}
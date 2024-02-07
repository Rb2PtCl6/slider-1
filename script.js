export default class viewer{
    #data = []
    #pointer = {
        header_id: undefined,
        select_id: undefined,
        reader_id: undefined,
        controls:{
            prew_id: undefined,
            next_id: undefined
        },
    }
    #active_slide = localStorage.getItem("test_active_slide") | 0
    #max_slide = 1
    constructor(pointer, json_url){
        if (!json_url || !pointer){
            throw new Error("No input parameters found!");
        }
        this.#validatePointer(this.#pointer,pointer)
        this.#validateElements(pointer)
        this.#pointer = pointer;
        this.readJson(json_url)
        .then((images) => {
            this.#max_slide = images.length
            this.#validate_active_slide()
            for (let i = 0; i < this.#max_slide; i++) {
                this.#data[i] = { id: i, url: images[i], is_loaded: false };
            }
            //console.log(this.#data)
            this.makeSelect()
            this.fillViewer()
            this.registerHandlers()
        })
        .catch((error) => {
            console.error(`Error fetching JSON from ${json_url}`, error);
        });
    }
    #validate_active_slide(){
        if (this.#active_slide < 0){
            localStorage.setItem("test_active_slide",0)
            this.#active_slide = 0
        } else if (this.#active_slide > this.#max_slide){
            localStorage.setItem("test_active_slide",this.#max_slide - 1)
            this.#active_slide = this.#max_slide - 1
        }
    }
    #validatePointer(pointer1, pointer2){
        for (var i of Object.keys(pointer1)){
            if (!pointer2.hasOwnProperty(i)){
                throw new Error("No necessary pointer's key found!");
            }
            if (typeof pointer1[i] == "object"){
                this.#validatePointer(pointer1[i],pointer2[i])
            }
        }
    }
    #validateElements(pointer){
        for (var i of Object.keys(pointer)){
            if (typeof pointer[i] == "object"){
                this.#validateElements(pointer[i])
            } else if (!this.makeId(pointer[i])){
                throw new Error("No necessary element found!");
            }
        }
    }
    fillViewer(){
        for (var i = 0; i < this.#max_slide; i++){
            this.createRawBox(this.#pointer.reader_id, `page${i}`)
        }
        this.toggleHidden(`page${this.#active_slide}`)
        this.downloadImage(this.#active_slide)
    }
    makeSelect(){
        var tmp = ""
        for(var i = 0; i < this.#max_slide; i++){
            if (i == this.#active_slide){
                tmp += `<option selected value="${i}">${i + 1} / ${this.#max_slide}</option>`
            } else{
                tmp += `<option value="${i}">${i + 1} / ${this.#max_slide}</option>`
            }
        }
        this.makeId(this.#pointer.select_id).innerHTML = tmp
        this.toggleHidden(this.#pointer.select_id)
    }
    /**
     * @param {string} parent_id
     * @param {string} child_id
     */
    createRawBox(parent_id, child_id){
        var elem = document.createElement("div")
        elem.id = child_id
        elem.classList.add("page","loading","hidden")
        elem.innerHTML = "<img class='page_img'></img>"
        this.makeId(parent_id).append(elem)
    }
    // operations with numbers
    /**
     * @param {number} num
     */
    setCurrentNumber(num){
        this.#active_slide = num
        localStorage.setItem("test_active_slide",num)
        this.setCurrentNumberInSelect(num)
    }
    // block's changers
    setCurrentNumberInSelect(num){
        this.makeId(this.#pointer.select_id).selectedIndex = num
    }
    // hide/shiw bloks
    toggleHidden(id){
        this.makeId(id).classList.toggle("hidden")
    }
    // remove loading icon
    removeLoading(id){
        this.makeId(id).classList.remove("loading")
    }
    /**
     * @return {HTMLElement}
     */
    makeId(id){
        return document.getElementById(id)
    }
    selectSize(id, img_h, img_w){
        var classes = ["page_img_auto_100","page_img_100_auto"];
        //alert(`img: { w: ${img_w}, h: ${img_h}}\nblock: { w: ${document.querySelector(`#page${id}`).clientWidth}, h: ${document.querySelector(`#page${id}`).clientHeight}}`)
        var block_height = this.makeId(id).clientHeight;
        var block_width = this.makeId(id).clientWidth;
    
        var img_props = img_w / img_h;
        var block_props = block_width / block_height;
    
        if (img_props > block_props){
            return classes[1];
        } else {
            return classes[0];
        }
    }
    changeSlide(new_num){
        var current = this.#active_slide
        var this_id = `page${current}`
        var new_id = `page${new_num}`
        if (new_num >= 0 && new_num < this.#max_slide ){
            this.toggleHidden(this_id)
            this.toggleHidden(new_id)
            this.setCurrentNumber(new_num)
            if (!this.#data[this.#active_slide].is_loaded){
                this.downloadImage(this.#active_slide)
            }
        }
    }
    // event handlers
    registerHandlers(){
        document.onkeydown = (e) => {
            if (e.key == "ArrowLeft"){
                this.changeSlide(this.#active_slide - 1)
            } else if (e.key == "ArrowRight"){
                this.changeSlide(this.#active_slide + 1)
            }
        }
        this.makeId(this.#pointer.controls.prew_id).addEventListener("click", () => { 
            this.changeSlide(this.#active_slide - 1) 
        })
        this.makeId(this.#pointer.controls.next_id).addEventListener("click", () => { 
            this.changeSlide(this.#active_slide + 1) 
        })
        this.makeId(this.#pointer.select_id).addEventListener("change", () => {
            this.changeSlide(this.makeId(this.#pointer.select_id).selectedIndex)
        })
    }
    // network
    async readJson(url){
        var response = await fetch(url)
        var json = await response.json();
        return Object.values(json)
    }
    downloadImage(id){
        var _this = this
        var downImage = new Image
        downImage.onload = function(){
            _this.removeLoading(`page${id}`)
            document.querySelector(`#page${id} img`).classList.add(_this.selectSize(`page${id}`, this.height, this.width))
            _this.#data[id].is_loaded = true
            document.querySelector(`#page${id} img`).src = this.src
        }
        downImage.src = this.#data[id].url
    }
}
export default class viewer{
    #data = []
    #pointer = {
        select_id: undefined,
        reader_id: undefined,
        controls:{
            prew_id: undefined,
            next_id: undefined
        },
    }
    #active_slide = localStorage.getItem("test_active_slide") | 0
    #max_slide = 1
    /**
     * @param {object} pointer
     * @param {string} json_url
     */
    constructor(pointer, json_url){
        if (!json_url || !pointer){
            this.showError("No input parameters found!");
        }
        this.#checkPointer(this.#pointer, pointer, "")
        this.readJson(json_url)
        .then((images) => {
            this.#max_slide = images.length
            this.#validate_active_slide()
            for (var i = 0; i < this.#max_slide; i++) {
                this.#data[i] = { url: images[i], is_loaded: false };
            }
            console.table(images)
            console.table(this.#data)
            console.table(this.#data[1])
            //console.log(this.#data)
            this.makeSelect()
            this.fillViewer()
            this.registerHandlers()
        })
        .catch((error) => {
            this.showError(`Error fetching JSON from ${json_url}`, error);
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
    /**
     * @param {object} pointer1
     * @param {object} pointer2
     * @param {string} base
     */
    #checkPointer(pointer1, pointer2, base){
        for (var i of Object.keys(pointer1)){
            if (pointer1.hasOwnProperty(i)){
                if (!pointer2[i]){
                    this.showError("Empty key found!")
                } else {
                    if (typeof pointer2[i] == "object"){
                        this.#checkPointer(pointer1[i],pointer2[i],i)
                    } else if (typeof pointer2[i] == "string"){
                        if (this.makeId(pointer2[i])){
                            var where = this.#pointer
                            if (base != ""){
                                where = where[base]
                            }
                            where[i] = pointer2[i]
                        } else {
                            this.showError("No necessary element found!")
                        }
                    } else {
                        this.showError("Wrong type of value found!")
                    }
                }
            } else {
                this.showError("No necessary pointer's key found!")
            }
        }
    }
    /**
     * @param {string} text
     */
    showError(text){
        alert(text)
        throw new Error(text)
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
    /**
     * @param {number} id
     */
    toggleHidden(id){
        this.makeId(id).classList.toggle("hidden")
    }
    // remove loading icon
    /**
     * @param {number} id
     */
    markAsLoaded(id){
        this.makeId(`page${id}`).classList.remove("loading")
        this.#data[id].is_loaded = true
    }
    /**
     * @param {number} id
     * @return {HTMLElement}
     */
    makeId(id){
        return document.getElementById(id)
    }
    /**
     * @param {number} id
     * @param {number} img_h
     * @param {number} img_w
     */
    selectSize(id, img_h, img_w){
        var classes = ["page_img_auto_100","page_img_100_auto"]
        var block_height = this.makeId(id).clientHeight;
        var block_width = this.makeId(id).clientWidth;

        var k = block_height / img_h
        if (img_w * k <= block_width){
            return classes[0]
        } else {
            return classes[1]
        }
    }
    /**
     * @param {number} new_num
     */
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
    /**
     * @param {string} url
     * @return {Promise<string[]>}
     */
    async readJson(url){
        var response = await fetch(url)
        var json = await response.json();
        return Object.values(json)
    }
    /**
     * @param {number} id
     */
    downloadImage(id){
        var downImage = new Image
        downImage.addEventListener("load", () => {
            this.markAsLoaded(id)
            downImage.classList.add(this.selectSize(`page${id}`, downImage.height, downImage.width))
            this.makeId(`page${id}`).append(downImage)
        })
        downImage.src = this.#data[id].url
    }
}
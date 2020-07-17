const calories_url  = "http://localhost:3000/api/v1/calorie_entries"
const qs = (item) => document.querySelector(item);
const ce = (item) => document.createElement(item);

const reqObj = (method, body) => {
    return {
        method,
        headers: {
            "Content-type":"application/json"
        },
        ...(body && {body: JSON.stringify(body)})
    }
}

const create_data = (event) => {
    return {
        calorie_entry: {
            calorie: event.target[0].value,
            note: event.target[1].value
        }
    }
}

const add_to_calorie_bar = (amount) => {
    let progress = qs(".uk-progress");
    let current = parseInt(progress.getAttribute("value"), 10)
    progress.setAttribute("value", `${current + amount}`)
}
const add_to_list = (item) => {
    let calories_list = qs("#calories-list");
    let list_item = ce("li")
    list_item.className = "calories-list-item";
    list_item.innerHTML = `<div class="uk-grid"> 
                                <div class="uk-width-1-6"> 
                                    <strong></strong> <span>kcal</span> 
                                </div> 
                                <div class="uk-width-4-5"> 
                                    <em class="uk-text-meta">
                                    </em>
                                </div> 
                            </div> 
                            <div class="list-item-menu"> 
                                <a class="edit-button" uk-toggle="target: #edit-form-container" uk-icon="icon: pencil"></a> 

                                <a class="delete-button" uk-icon="icon: trash"></a> 
                            </div> `
    calories_list.append(list_item);
    list_item.querySelector("strong").innerText = item.calorie;
    list_item.querySelector(".uk-text-meta").innerText = item.note;

    let edit_button = list_item.querySelector(".edit-button");
    edit_button.addEventListener("click", () => {
        let form = qs("#edit-calorie-form");
        form.querySelector("input").value = item.calorie;
        form.querySelector("textarea").value = item.note;
        form.addEventListener("submit", () => {
            event.preventDefault();
            fetch(calories_url + `/${item.id}`, reqObj("PATCH", create_data(event)))
            .then(resp => resp.json())
            .then(new_item => {
                let progress = qs(".uk-progress");
                progress.setAttribute("value", `${parseInt(progress.getAttribute('value'), 10) + new_item.calorie - item.calorie}`);
                list_item.querySelector("strong").innerText = new_item.calorie || item.calorie;
                list_item.querySelector(".uk-text-meta").innerText = new_item.note || item.note;
                item = new_item;
                qs("#edit-form-container").style.display = "none"
            });
        })
    })
    let delete_button = list_item.querySelector(".delete-button");
    delete_button.addEventListener("click", () => {
        fetch(calories_url + `/${item.id}`, reqObj("delete", null))
        .then(resp => {
            calories_list.removeChild(list_item)
            add_to_calorie_bar(-1 * item.calorie);
        })
    })
}

const load_calories = () =>{
    fetch(calories_url)
    .then(resp => resp.json())
    .then(calories => {
        for (let item of calories) {
            add_to_list(item);
            add_to_calorie_bar(item.calorie);
        }
    })
}

const load_calorie_form = () =>{
    let form = qs("#new-calorie-form");
    let btn = form.querySelector(".uk-button").type = "submit";

    form.addEventListener("submit", () =>{
        event.preventDefault();
        fetch(calories_url, reqObj("POST", create_data(event)))
        .then(resp => resp.json())
        .then(item => {
            add_to_list(item);
            add_to_calorie_bar(item.calorie);
            form.reset();
        });
    })
}



const load_BMR_form = () =>{
    let form = qs("#bmr-calulator");
    let btn = form.querySelector(".uk-button").type = "submit";
    let lower_range = qs("#lower-bmr-range");
    let upper_range = qs("#higher-bmr-range");
    qs(".uk-progress").max = (parseInt(lower_range.innerText, 10) + parseInt(upper_range.innerText, 10)) / 2;
    form.addEventListener("submit", () =>{
        event.preventDefault();
        
        const weight = event.target[0].value;
        const height = event.target[1].value;
        const age = event.target[2].value;

        let lower = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age);
        let upper = 655 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
        qs("#lower-bmr-range").innerText = lower;
        qs("#higher-bmr-range").innerText = upper;
        qs(".uk-progress").max = (lower + upper) / 2;
        form.reset();
    })
}



document.addEventListener("DOMContentLoaded", () => {
    load_calories();
    load_calorie_form();
    load_BMR_form();
})

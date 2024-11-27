// This script checks for the current page of all heyflow-wrapper elements every 1 seconds and synchronizes each page.

let history = [];
let foobar = {};
function checkHeyflowWrappers() {
    const heyflowWrappers = document.querySelectorAll('heyflow-wrapper');
        
    heyflowWrappers.forEach((wrapper, index) => {
        let visible_section = wrapper.shadowRoot.querySelectorAll('section.visible'); // get visible page
        let visible_section_id = wrapper.shadowRoot.querySelectorAll('section.visible')[0].id; // append visible page id to 
        //console.log(`Wrapper ${index}:`, visible_section);
        foobar[index] = visible_section_id;

        // have to let the current_page load first
        if (history.length !== 0) {
            //console.log(visible_section_id, history.slice(-1)[0], visible_section_id !== history.slice(-1)[0]);

            if (visible_section_id !== history.slice(-1)[0]) {
                if (history.includes(visible_section_id) === false) {
                    history.push(visible_section_id);
                } else {
                    visible_section[0].querySelectorAll('button')[0].click();
                }
            }
        } else {
            history.push(foobar[0]);
        }
    });
    
    //console.log(`Wrappers:`, foobar, history);
}
  
document.addEventListener('DOMContentLoaded', () => {
    // Run the check every 1 seconds
    setInterval(checkHeyflowWrappers, 1000);
});
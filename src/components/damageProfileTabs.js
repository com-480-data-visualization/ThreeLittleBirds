export function initTabs() {
    const tablinks = document.querySelectorAll(".tablinks");

    tablinks.forEach(button => {
        button.addEventListener("click", (evt) => {
            const aircraftName = evt.currentTarget.getAttribute("data-target");
            
            // Hide all tab content
            const tabcontent = document.getElementsByClassName("tabcontent");
            for (let i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }

            // Remove active class
            for (let i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
            }

            // Show current tab and set active
            document.getElementById(aircraftName).style.display = "block";
            evt.currentTarget.classList.add("active");
        });
    });
}

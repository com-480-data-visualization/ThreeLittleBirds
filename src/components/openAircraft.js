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

(function openAircraft(evt, aircraftName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(aircraftName).style.display = "block";
  evt.currentTarget.className += " active";
}
    
);
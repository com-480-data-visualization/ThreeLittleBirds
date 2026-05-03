export function initTabs() {
    const radioInputs = document.querySelectorAll('.radio-inputs input[type="radio"]');
    const tabcontents = document.querySelectorAll(".tabcontent");

    radioInputs.forEach(input => {
        input.addEventListener("change", (evt) => {
            const targetId = evt.target.getAttribute("data-target");

            // 1. Hide all tab content
            tabcontents.forEach(content => {
                content.style.display = "none";
            });

            // 2. Show the content associated with the clicked radio
            const selectedContent = document.getElementById(targetId);
            if (selectedContent) {
                selectedContent.style.display = "block";
                
                // Trigger a window resize event to ensure D3 charts 
                // inside hidden tabs render correctly when shown
                window.dispatchEvent(new Event('resize'));
            }
        });
    });
}
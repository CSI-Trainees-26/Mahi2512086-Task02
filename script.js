lucide.createIcons();

/* ---WATER TRACKER--- */

const WATER_GOAL=2000;
const WATER_INCREMENT=250;

const waterAmountElement=document.getElementById("waterAmount");
const addWaterButton=document.getElementById("addWaterBtn");  
const waterProgress=document.querySelector(".water-progress"); 

let waterAmount= Number(localStorage.getItem("waterAmount")) || 1250; // Default to 1250 if not set

function updateWaterAmount() {

    //display current water status//
    waterAmountElement.textContent = waterAmount.toLocaleString(); // Format with commas

    //calculate progress percentage//
    const progressPercentage = Math.min(
        (waterAmount/WATER_GOAL)*100,
        100); // Cap at 100%

    //update progress bar//
    waterProgress.style.width = progressPercentage+"%";

    //update button
    if (waterAmount>=WATER_GOAL){
        addWaterButton.textContent = "Goal Reached";
    } else{
        addWaterButton.textContent = "+250 ml";
    }
}
//add water button

addWaterButton.addEventListener("click",function(){
    if (waterAmount<WATER_GOAL){

    //add 250ml
    waterAmount+=WATER_INCREMENT;

    //SAVE TO LOCAL STORAGE
    localStorage.setItem("waterAmount",waterAmount);

    //update the ui
    updateWaterAmount()
    }
});
//load water data
updateWaterAmount();

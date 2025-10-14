// Current year
const currentYear = new Date().getFullYear();
document.getElementById("currentYear").textContent = currentYear;

// Game
function initFlagGame(jsonPath, level, isChallengeMode = false) {
    const flag = document.getElementById("flag");
    const score = document.getElementById("score");
    const container = document.querySelector(".container");
    const win = document.querySelector(".win");
    const winP = document.querySelector(".win p");
    const challengeWarning = document.getElementById("challengeWarning");

    let flagsArray = [];
    let availableFlags = [];
    let flagsGuessed = 0;
    let currentFlag;

    // Load flags from JSON file
    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            flagsArray = data;
            availableFlags = [...flagsArray];
            initGame();
        })
        .catch(error => {
            console.error("Error loading flags:", error);
        });

    function initGame() {
        // If no more flags available, restart the game
        if (availableFlags.length === 0) {
            availableFlags = [...flagsArray];
            container.style.display = "none";
            score.style.display = "none";
            win.style.display = "flex";
            winP.innerHTML = `Congratulations! <br>Your score was <span class="highlight"> ${flagsGuessed} / ${flagsArray.length} </span> in ${level} level.`;
            return;
        }

        // Choose random flag from available ones
        let randomIndex = Math.floor(Math.random() * availableFlags.length);
        currentFlag = availableFlags[randomIndex];

        // Remove current flag from available flags
        availableFlags.splice(randomIndex, 1);

        // Display the flag image
        flag.innerHTML = `<img src="${currentFlag.flag}" alt="${currentFlag.name} flag">`;

        // Create options: correct answer + 3 random wrong options from other flags
        let wrongOptions = flagsArray
            .filter(flag => flag.name !== currentFlag.name)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(flag => flag.name);

        // Combine wrong options with correct one and shuffle
        let allOptions = [...wrongOptions, currentFlag.name].sort(() => Math.random() - 0.5);

        // Reset ALL buttons before assigning new values
        const options = document.querySelectorAll(".option");
        options.forEach((option, index) => {
            // Remove style classes instead of inline reset
            option.classList.remove("correct", "wrong", "disabled");
            option.innerHTML = allOptions[index];
        });

        // Update score
        score.innerHTML = `Score: ${flagsGuessed} / ${flagsArray.length}`;
    }

    function handleGameOver() {
        if (isChallengeMode) {
            // Modo CHALLENGE - game over in the first mistake
            availableFlags = [...flagsArray];
            container.style.display = "none";
            score.style.display = "none";
            win.style.display = "flex";

            winP.innerHTML = `What a shame!<br>Your score was <span class="highlight"> ${flagsGuessed} / ${flagsArray.length} </span> in ${level} level.`;
        } else {
            // Normal mode - keep playing after mistake
            setTimeout(() => {
                initGame();
            }, 2000);
        }
    }

    function handleOptionClick(event) {
        const option = event.target;
        const options = document.querySelectorAll(".option");

        // Disable all clicks after an answer
        options.forEach(opt => {
            opt.classList.add("disabled");
        });

        if (option.textContent === currentFlag.name) {
            option.classList.add("correct");
            flagsGuessed++;

            // Wait a bit and generate new question
            setTimeout(() => {
                initGame();
            }, 1000);
        } else {
            option.classList.add("wrong");

            // Show which was the correct answer
            options.forEach(opt => {
                if (opt.textContent === currentFlag.name) {
                    opt.classList.add("correct");
                }
            });

            // CHALLENGE mode ends game on mistake, normal mode continues
            handleGameOver();
        }

        // Update score
        score.innerHTML = `Score: ${flagsGuessed} / ${flagsArray.length}`;
    }

    // Add event listeners only once
    document.querySelector(".options").addEventListener("click", function (event) {
        if (event.target.classList.contains("option")) {
            handleOptionClick(event);
        }
    });

    if (isChallengeMode) {
        challengeWarning.innerHTML = `In this mode, if you make a mistake it's game over`;
    }
}
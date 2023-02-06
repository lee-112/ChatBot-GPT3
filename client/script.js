import bot from './assets/bot.svg';
import user from './assets/user.svg';


const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
let loadInterval;

// Function: Creates an animated '...' dot loading effect.
function loader(element) {
    element.textContent = '';

    // Set an interval to run the function every 300 milliseconds.
    loadInterval = setInterval(() => {
        element.textContent += '.';
        if(element.textContent === '....') 
            element.textContent = '';
    }, 300)
}

// Function: Simulates a typing effect by gradually adding characters.
function typeText(element, text) {
    let index = 0;

    // Set an interval to run the following function every 20 milliseconds.
    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            ++index;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

// Function: For generating a unique identifier.
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${timestamp}-${hexadecimalString}`;
}

// Function: Used to return an HTML string for the chat interface message.
function chatStripe(isAi, value, uniqueId) {
    return (
        `
            <div class="wrapper ${isAi && 'ai'}">
                <div class="chat">
                    <div class="profile">
                        <img
                            src="${isAi ? bot : user}"
                            alt="${isAi ? 'bot' : 'user'}"
                        />
                    </div>
                    <div class="message" id=${uniqueId}>${value}</div>
                </div>
            </div>
        `
    )
}

const handleSubmit = async(e) => { 
    // Prevent the default behavior of the form submission event
    e.preventDefault();

    // Create a FormData object from the form element
    const data = new FormData(form);

    // Add a user's chat stripe to the chatContainer by passing in false and the prompt text from the form data
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

    form.reset();

    // Generate a unique ID for the bot's chat stripe
    const uniqueId = generateUniqueId();

    // Add the bot's chat stripe to the chatContainer by passing in true, a placeholder text, and the unique ID
    // Set the scroll position of the chatContainer to the bottom
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Get the chat stripe element with the generated unique ID
    // Run the loader animation on the bot's chat stripe element
    const messageDiv = document.getElementById(uniqueId);
    loader(messageDiv);

    // fetch data from the server -> bot response
    const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    // Clears the interval set in the loader function by calling.
    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const parseData = data.bot.trim();
        typeText(messageDiv, parseData);
    } else {
        const err = await response.text();
        messageDiv.innerHTML = "Opps... Somthing went wrong!";
        alert(err);
    }
}

// Add an event listener to the form 'submit' event
form.addEventListener('submit', handleSubmit);

// Add an event listener to the form 'keyup' event
form.addEventListener('keyup', (e) => {
    // Check if keyCode key 13 (the 'Enter' key)
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});

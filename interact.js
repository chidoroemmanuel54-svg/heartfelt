const yesButton = document.querySelector(".yes-button");
const noButton = document.querySelector(".no-button");

let yesFontSize = 16;
let noScale = 1;
let noClickCount = 0;

if (yesButton && noButton) {
  yesButton.addEventListener('click', async () => {
    try {
      const res = await fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'this person',
          email: sessionStorage.getItem('email') || 'not provided',
          message: 'They said yes!'
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Confirmation sent.');
        window.location.href = '/end.html';
      } else {
        console.error(data);
        alert(`Failed to send confirmation: ${data.detail || data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error sending confirmation.');
    }
  });
  noButton.addEventListener("click", () => {
    if (noClickCount >= 4) {
      return;
    }

    noClickCount += 1;

    if (noClickCount === 4) {
      noButton.disabled = true;
      window.location.href = '/end.html';
      return;
    }

    yesFontSize += 10;
    noScale = Math.max(0.35, noScale - 0.15);

    let helperText = "say yes na";

    if (noClickCount >= 2) {
      helperText = "abeg na";
    }

    if (noClickCount >= 3) {
      helperText = "chai";
    }

    yesButton.style.fontSize = `${yesFontSize}px`;
    noButton.style.transform = `scale(${noScale})`;
    noButton.innerHTML = `<span class="main-answer">No</span><span class="small-answer">${helperText}</span>`;
  });
}

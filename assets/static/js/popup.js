// HTML Structure
const popupHTML = `
	<div id="exitIntentPopup" class="popup-container">
		<div class="popup-content">
			<button class="close-btn">&times;</button>
			<h2>LIMITED ONE-TIME<br/>24-HOUR OFFER</h2>
			<h3>Complete The Application Within 24-Hours To Unlock Your Additional $250 OFF Coupon!</h3>
			<hr>
			<a href="#heyflow" id="cta" class="btn btn-lg btn-success" style="width: 75%; margin: auto; display: block">UNLOCK MY COUPON</a>
		</div>
	</div>
	<div id="countdownTimer" class="countdown-timer"></div>
`;

// CSS Styles
const styles = `
	.popup-container {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		z-index: 1000;
	}

	.popup-content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: white;
		padding: 20px;
		border-radius: 5px;
		max-width: 90%;
		width: 400px;
	}

	.close-btn {
		position: absolute;
		right: 10px;
		top: 10px;
		cursor: pointer;
		background: none;
		border: none;
		font-size: 24px;
	}

	.countdown-timer {
		display: none;
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background-color: #016CAF;
		color: #D4AF37;
		padding: 10px;
		text-align: center;
		z-index: 999;
		font-weight: bold;
	}`;

class ExitIntentPopup {
	constructor() {
		this.initialize();
	}

	initialize() {
		this.injectStyles();
		this.injectHTML();

		this.popup = document.getElementById('exitIntentPopup');
		this.timer = document.getElementById('countdownTimer');
		this.closeBtn = this.popup.querySelector('.close-btn');
		this.ctaBtn = this.popup.querySelector('#cta');
		this.thirtyDaySpan = document.getElementById('thirtyDayDate');
		this.twentyFourHourSpan = document.getElementById('twentyFourHourDate');

		// Initialize dates regardless of whether popup was recently shown
		if (this.getCookieDate()) {
			this.updateDates();
		}

		if (!this.wasRecentlyShown()) {
			this.setupEventListeners();
		} else {
			this.startCountdown();
		}
	}

	injectStyles() {
		const styleElement = document.createElement('style');
		styleElement.textContent = styles;
		document.head.appendChild(styleElement);
	}

	injectHTML() {
		const div = document.createElement('div');
		div.innerHTML = popupHTML;
		document.body.appendChild(div);
	}

	setupEventListeners() {
		document.addEventListener('mouseout', (e) => {
			if (e.clientY <= 0 && !this.wasRecentlyShown()) {
				this.popup.style.display = 'block';
				this.setCookie();
				this.startCountdown();
			}
		});

		// Fast upward scrolling
		let lastScrollTop = 0;
		let scrollThreshold = 20;
		let scrollTimer;

		window.addEventListener('scroll', () => {
			const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
			const scrollDifference = lastScrollTop - currentScrollTop;

			clearTimeout(scrollTimer);

			scrollTimer = setTimeout(() => {
				if (scrollDifference > scrollThreshold && !this.wasRecentlyShown()) {
					this.popup.style.display = 'block';
					this.setCookie();
					this.startCountdown();
				}
			}, 150);

			lastScrollTop = currentScrollTop;
		});

		this.closeBtn.addEventListener('click', () => {
			this.popup.style.display = 'none';
		});

		this.ctaBtn.addEventListener('click', () => {
			this.popup.style.display = 'none';
		});
	}

	updateDates() {
		const cookieDate = this.getCookieDate();
		if (!cookieDate) return;

		const thirtyDaysDate = new Date(cookieDate);
		thirtyDaysDate.setDate(thirtyDaysDate.getDate() + 30);
		this.thirtyDaySpan.textContent = thirtyDaysDate.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});

		const twentyFourHoursDate = new Date(cookieDate);
		twentyFourHoursDate.setHours(twentyFourHoursDate.getHours() + 24);
		this.twentyFourHourSpan.textContent = twentyFourHoursDate.toLocaleString('en-US', {
			timeZone: 'America/Detroit',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		});
	}

	getCookieDate() {
		const cookies = document.cookie.split(';');
		for (let cookie of cookies) {
			cookie = cookie.trim();
			if (cookie.startsWith('cookieInitDate=')) {
				return new Date(cookie.substring('cookieInitDate='.length));
			}
		}
		return null;
	}

	setCookie() {
		const date = new Date();
		const popupExpiration = new Date(date.getTime() + (365 * 24 * 60 * 60 * 1000));
		const timerExpiration = new Date(date.getTime() + (24 * 60 * 60 * 1000));
		document.cookie = `exitPopupShown=true; expires=${popupExpiration.toUTCString()}; path=/`;
		document.cookie = `timerExpiration=${timerExpiration.toUTCString()}; path=/`;
		document.cookie = `cookieInitDate=${date.toUTCString()}; path=/`;
		this.updateDates();
	}

	getTimerExpiration() {
		const cookies = document.cookie.split(';');
		for (let cookie of cookies) {
			cookie = cookie.trim();
			if (cookie.startsWith('timerExpiration=')) {
				return new Date(cookie.substring('timerExpiration='.length));
			}
		}
		return null;
	}

	wasRecentlyShown() {
		return document.cookie.includes('exitPopupShown=true');
	}

	startCountdown() {
		const timerExpiration = this.getTimerExpiration();
		if (!timerExpiration) return;

		const updateTimer = () => {
			const now = new Date().getTime();
			const timeLeft = timerExpiration.getTime() - now;

			if (timeLeft < 0) {
				this.timer.style.display = 'none';
				return;
			}

			const hours = Math.floor(timeLeft / (1000 * 60 * 60));
			const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

			this.timer.style.display = 'block';
			this.timer.textContent = `📆 $250 OFF ONE-TIME 24-HOUR OFFER ENDS IN: ${hours}h ${minutes}m ${seconds}s ⏳`;
		};

		const showCoupon = () => {
			const couponElements = document.querySelectorAll('#coupon');
			couponElements.forEach(element => {
				element.style.display = 'block';
			});
		};

		this.updateDates();
		showCoupon();
		updateTimer();
		setInterval(updateTimer, 1000);
	}
}
// ===== Бургер-меню =====

const burgerBtn = document.getElementById('burgerBtn');
const navMenu = document.getElementById('navMenu');

burgerBtn.addEventListener('click', function () {
    navMenu.classList.toggle('open');
});

const navLinks = navMenu.querySelectorAll('a');

navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        navMenu.classList.remove('open');
    });
});

// ===== Кнопка "Наверх" =====

const toTopBtn = document.getElementById('toTopBtn');

if (toTopBtn) {
    window.addEventListener('scroll', function () {
        if (window.scrollY > 600) {
            toTopBtn.classList.add('show');
        } else {
            toTopBtn.classList.remove('show');
        }
    });

    toTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== Кликабельные услуги: клик → скролл + выбор в форме =====

const serviceSelect = document.getElementById('service');
const bookingBox = document.querySelector('.booking-box');

document.querySelectorAll('.service-card').forEach(function (card) {
    card.addEventListener('click', function () {
        serviceSelect.value = card.dataset.service;

        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });

        bookingBox.classList.remove('flash');
        void bookingBox.offsetWidth;
        bookingBox.classList.add('flash');
    });
});

// ===== Запись: демо-база занятых окон =====

const ALL_SLOTS = [];
for (let h = 10; h < 21; h++) {
    ALL_SLOTS.push(h + ':00');
}

function getBookedSlots(dateStr) {
    const day = Number(dateStr.slice(-2));
    if (day % 5 === 0) return ALL_SLOTS.slice();
    const booked = [];
    ALL_SLOTS.forEach(function (slot, i) {
        if ((i + day) % 3 === 0) booked.push(slot);
    });
    return booked;
}

function dayStatus(dateStr) {
    const booked = getBookedSlots(dateStr);
    if (booked.length === 0) return 'free';
    if (booked.length === ALL_SLOTS.length) return 'closed';
    return 'partial';
}

function formatDate(d) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
}

const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const schedulePopup = document.getElementById('schedulePopup');
const dateWrap = dateInput.closest('.date-wrap');

dateInput.min = formatDate(new Date());

// ===== Всплывающее расписание =====

function groupHtml(cls, title, dates) {
    if (dates.length === 0) return '';
    let chips = '';
    dates.forEach(function (dateStr) {
        chips += '<span class="day-chip ' + cls + '" data-date="' + dateStr + '">' +
                 Number(dateStr.slice(-2)) + '</span>';
    });
    return '<div class="schedule-group ' + cls + '">' +
           '<h4>' + title + '</h4>' +
           '<div class="day-chips">' + chips + '</div></div>';
}

function renderPopup() {
    const groups = { free: [], partial: [], closed: [] };
    const now = new Date();

    for (let i = 0; i < 14; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() + i);
        const dateStr = formatDate(d);
        groups[dayStatus(dateStr)].push(dateStr);
    }

    schedulePopup.innerHTML =
        groupHtml('free', '🟢 Полностью свободные', groups.free) +
        groupHtml('partial', '🟡 Есть свободные окна', groups.partial) +
        groupHtml('closed', '🔴 Полностью занято', groups.closed) +
        '<div class="schedule-legend">' +
        '<span><span class="dot free"></span>свободно</span>' +
        '<span><span class="dot partial"></span>частично</span>' +
        '<span><span class="dot closed"></span>занято</span>' +
        '</div>';

    schedulePopup.querySelectorAll('.day-chip:not(.closed)').forEach(function (chip) {
        chip.addEventListener('click', function () {
            dateInput.value = chip.dataset.date;
            updateTimeOptions();
            schedulePopup.hidden = true;
        });
    });
}

function showPopup() {
    renderPopup();
    schedulePopup.hidden = false;
}

dateWrap.addEventListener('mouseenter', showPopup);
dateWrap.addEventListener('mouseleave', function () {
    schedulePopup.hidden = true;
});
dateInput.addEventListener('focus', showPopup);

// ===== Время: только свободные окна =====

function updateTimeOptions() {
    const dateStr = dateInput.value;

    if (!dateStr) {
        timeSelect.innerHTML = '<option value="" disabled selected>Сначала выберите дату</option>';
        return;
    }

    const booked = getBookedSlots(dateStr);
    const freeSlots = ALL_SLOTS.filter(function (s) {
        return booked.indexOf(s) === -1;
    });

    if (freeSlots.length === 0) {
        timeSelect.innerHTML = '<option value="" disabled selected>На этот день всё занято</option>';
        return;
    }

    let html = '<option value="" disabled selected>Выберите время</option>';
    freeSlots.forEach(function (slot) {
        html += '<option value="' + slot + '">' + slot + '</option>';
    });
    timeSelect.innerHTML = html;
}

dateInput.addEventListener('change', updateTimeOptions);

// ===== Отправка формы без перезагрузки =====

const bookingForm = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');

if (bookingForm) {
    bookingForm.addEventListener('submit', function (event) {
        event.preventDefault();

        fetch(bookingForm.action, {
            method: 'POST',
            body: new FormData(bookingForm),
            headers: { 'Accept': 'application/json' }
        })
        .then(function (response) {
            if (response.ok) {
                bookingForm.hidden = true;
                formSuccess.hidden = false;
            } else {
                alert('Что-то пошло не так. Попробуйте ещё раз!');
            }
        })
        .catch(function () {
            alert('Ошибка сети. Проверьте интернет.');
        });
    });
}

// ===== Маска телефона =====

const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', function () {
    let digits = this.value.replace(/\D/g, '');

    if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
    }
    if (!digits.startsWith('7') && digits.length > 0) {
        digits = '7' + digits;
    }
    digits = digits.slice(0, 11);

    let formatted = '+7';
    if (digits.length > 1) formatted += ' (' + digits.slice(1, 4);
    if (digits.length >= 5) formatted += ') ' + digits.slice(4, 7);
    if (digits.length >= 8) formatted += '-' + digits.slice(7, 9);
    if (digits.length >= 10) formatted += '-' + digits.slice(9, 11);

    this.value = formatted;
});

phoneInput.addEventListener('focus', function () {
    if (this.value === '') this.value = '+7 (';
});

phoneInput.addEventListener('blur', function () {
    if (this.value === '+7 (' || this.value === '+7') this.value = '';
});
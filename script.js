
// PWA Installation
let deferredPrompt;
const installButton = document.createElement('button');
installButton.id = 'installButton';
installButton.className = 'btn btn-success mb-3';
installButton.innerHTML = '<i class="fas fa-download me-2"></i>Install App';

// Add install button to profile section
const profileCard = document.querySelector('.profile-card');
if (profileCard) {
  profileCard.prepend(installButton);
}

// Hide install button by default
installButton.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show the install button
  installButton.style.display = 'block';
  
  installButton.addEventListener('click', () => {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted install');
      } else {
        console.log('User dismissed install');
      }
      deferredPrompt = null;
    });
  });
});

// Hide install button after app is installed
window.addEventListener('appinstalled', () => {
  installButton.style.display = 'none';
  deferredPrompt = null;
});

// Check if app is already installed
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
  installButton.style.display = 'none';
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}





document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const profileForm = document.getElementById('profileForm');
    const birthdayForm = document.getElementById('birthdayForm');
    const upcomingBirthdays = document.getElementById('upcomingBirthdays');
    const pastBirthdays = document.getElementById('pastBirthdays');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const calendar = document.getElementById('calendar');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const editBirthdayModal = new bootstrap.Modal(document.getElementById('editBirthdayModal'));
    const saveEditBirthdayBtn = document.getElementById('saveEditBirthday');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const profileFormContainer = document.getElementById('profileFormContainer');
    const profileInfoContainer = document.getElementById('profileInfoContainer');
    
    // State
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
    let profile = JSON.parse(localStorage.getItem('profile')) || null;
    
    // Initialize
    initTheme();
    initProfile();
    renderBirthdays();
    generateCalendar(currentMonth, currentYear);
    
    // Event Listeners
    darkModeToggle.addEventListener('change', toggleDarkMode);
    profileForm.addEventListener('submit', saveProfile);
    birthdayForm.addEventListener('submit', addBirthday);
    prevMonthBtn.addEventListener('click', showPreviousMonth);
    nextMonthBtn.addEventListener('click', showNextMonth);
    saveEditBirthdayBtn.addEventListener('click', saveEditedBirthday);
    editProfileBtn.addEventListener('click', showProfileForm);
    
    // Functions
    function initTheme() {
        const darkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
        document.body.setAttribute('data-theme', darkModeEnabled ? 'dark' : 'light');
        darkModeToggle.checked = darkModeEnabled;
    }
    
    function toggleDarkMode() {
        const darkModeEnabled = darkModeToggle.checked;
        document.body.setAttribute('data-theme', darkModeEnabled ? 'dark' : 'light');
        localStorage.setItem('darkMode', darkModeEnabled ? 'enabled' : 'disabled');
    }
    
    function showProfileForm() {
        profileFormContainer.classList.remove('d-none');
        profileInfoContainer.classList.add('d-none');
    }
    
    function saveProfile(e) {
        e.preventDefault();
        
        profile = {
            name: document.getElementById('userName').value,
            birthday: document.getElementById('userBirthday').value,
            profession: document.getElementById('profession').value,
            gender: document.querySelector('input[name="userGender"]:checked').value
        };
        
        localStorage.setItem('profile', JSON.stringify(profile));
        showProfileInfo();
    }
    
    function showProfileInfo() {
        if (profile) {
            document.getElementById('profileName').textContent = profile.name;
            document.getElementById('profileBirthday').textContent = formatDisplayDate(profile.birthday);
            document.getElementById('profileProfession').textContent = profile.profession.charAt(0).toUpperCase() + profile.profession.slice(1);
            document.getElementById('profileGender').textContent = profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1);
            
            profileFormContainer.classList.add('d-none');
            profileInfoContainer.classList.remove('d-none');
        } else {
            profileFormContainer.classList.remove('d-none');
            profileInfoContainer.classList.add('d-none');
        }
    }
    
    function initProfile() {
        if (profile) {
            document.getElementById('userName').value = profile.name || '';
            document.getElementById('userBirthday').value = profile.birthday || '';
            document.getElementById('profession').value = profile.profession || '';
            
            if (profile.gender) {
                document.querySelector(`input[name="userGender"][value="${profile.gender}"]`).checked = true;
            }
            showProfileInfo();
        } else {
            profileFormContainer.classList.remove('d-none');
            profileInfoContainer.classList.add('d-none');
        }
    }
    
    function addBirthday(e) {
        e.preventDefault();
        
        const dateString = document.getElementById('birthdayDate').value;
        const formattedDate = formatStoredDate(dateString);
        
        const newBirthday = {
            id: Date.now(),
            name: document.getElementById('personName').value,
            date: formattedDate,
            gender: document.getElementById('personGender').value,
            relationship: document.getElementById('relationship').value,
            notes: document.getElementById('notes').value,
            createdAt: new Date().toISOString()
        };
        
        birthdays.push(newBirthday);
        localStorage.setItem('birthdays', JSON.stringify(birthdays));
        
        successModal.show();
        setTimeout(() => successModal.hide(), 2000);
        
        birthdayForm.reset();
        renderBirthdays();
        generateCalendar(currentMonth, currentYear);
    }
    
    function formatStoredDate(dateString) {
        // Create date in local timezone by adding noon time
        const localDate = new Date(`${dateString}T12:00:00`);
        // Return as YYYY-MM-DD format
        return localDate.toISOString().split('T')[0];
    }
    
    function formatDisplayDate(dateString) {
        const date = new Date(`${dateString}T12:00:00`);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    function renderBirthdays() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = [];
        const past = [];
        
        birthdays.forEach(birthday => {
            const birthDate = new Date(`${birthday.date}T12:00:00`);
            const nextBirthday = new Date(birthDate);
            nextBirthday.setFullYear(today.getFullYear());
            
            if (nextBirthday < today) {
                nextBirthday.setFullYear(today.getFullYear() + 1);
            }
            
            const daysRemaining = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
            
            if (daysRemaining <= 30) {
                upcoming.push({...birthday, daysRemaining});
            } else {
                past.push({...birthday, daysRemaining});
            }
        });
        
        // Sort upcoming by days remaining
        upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);
        
        // Sort past by most recent
        past.sort((a, b) => b.daysRemaining - a.daysRemaining);
        
        // Render upcoming birthdays
        if (upcoming.length > 0) {
            upcomingBirthdays.innerHTML = upcoming.map(birthday => createBirthdayCard(birthday)).join('');
        } else {
            upcomingBirthdays.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="fas fa-birthday-cake"></i>
                    <h4>No upcoming birthdays</h4>
                    <p>Add birthdays to see them here</p>
                </div>
            `;
        }
        
        // Render past birthdays
        if (past.length > 0) {
            pastBirthdays.innerHTML = past.map(birthday => createBirthdayCard(birthday)).join('');
        } else {
            pastBirthdays.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h4>No past birthdays</h4>
                    <p>Birthdays from more than 30 days ago will appear here</p>
                </div>
            `;
        }
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-birthday').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.birthday-card').dataset.id);
                editBirthday(id);
            });
        });
        
        document.querySelectorAll('.delete-birthday').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.birthday-card').dataset.id);
                deleteBirthday(id);
            });
        });
    }
    
    function createBirthdayCard(birthday) {
        const birthDate = new Date(`${birthday.date}T12:00:00`);
        const formattedDate = formatDisplayDate(birthday.date);
        
        let icon = '';
        switch(birthday.relationship) {
            case 'friend': icon = '👫'; break;
            case 'family': icon = '👨‍👩‍👧‍👦'; break;
            case 'sister': icon = '👧'; break;
            case 'brother': icon = '👦'; break;
            case 'girlfriend': icon = '💑'; break;
            case 'boyfriend': icon = '👩‍❤️‍👨'; break;
            default: icon = '🎉';
        }
        
        return `
            <div class="col-md-6">
                <div class="card birthday-card ${birthday.gender}" data-id="${birthday.id}">
                    <div class="days-remaining">${birthday.daysRemaining} days</div>
                    <div class="birthday-actions">
                        <button class="btn btn-sm btn-primary edit-birthday"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-birthday"><i class="fas fa-trash"></i></button>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${icon} ${birthday.name}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${formattedDate}</h6>
                        <p class="card-text">
                            <small class="text-muted">${birthday.relationship.charAt(0).toUpperCase() + birthday.relationship.slice(1)}</small>
                            ${birthday.notes ? `<p class="mt-2">${birthday.notes}</p>` : ''}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    function editBirthday(id) {
        const birthday = birthdays.find(b => b.id === id);
        if (!birthday) return;
        
        document.getElementById('editBirthdayId').value = birthday.id;
        document.getElementById('editPersonName').value = birthday.name;
        document.getElementById('editBirthdayDate').value = birthday.date;
        document.getElementById('editPersonGender').value = birthday.gender;
        document.getElementById('editRelationship').value = birthday.relationship;
        document.getElementById('editNotes').value = birthday.notes || '';
        
        editBirthdayModal.show();
    }
    
    function saveEditedBirthday() {
        const id = parseInt(document.getElementById('editBirthdayId').value);
        const index = birthdays.findIndex(b => b.id === id);
        
        if (index !== -1) {
            const dateString = document.getElementById('editBirthdayDate').value;
            const formattedDate = formatStoredDate(dateString);
            
            birthdays[index] = {
                ...birthdays[index],
                name: document.getElementById('editPersonName').value,
                date: formattedDate,
                gender: document.getElementById('editPersonGender').value,
                relationship: document.getElementById('editRelationship').value,
                notes: document.getElementById('editNotes').value
            };
            
            localStorage.setItem('birthdays', JSON.stringify(birthdays));
            editBirthdayModal.hide();
            renderBirthdays();
            generateCalendar(currentMonth, currentYear);
        }
    }
    
    function deleteBirthday(id) {
        if (confirm('Are you sure you want to delete this birthday?')) {
            birthdays = birthdays.filter(b => b.id !== id);
            localStorage.setItem('birthdays', JSON.stringify(birthdays));
            renderBirthdays();
            generateCalendar(currentMonth, currentYear);
        }
    }
    
    function generateCalendar(month, year) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        
        currentMonthYear.textContent = `${monthNames[month]} ${year}`;
        
        let html = '<table class="calendar table table-bordered">';
        html += '<thead><tr>';
        html += '<th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>';
        html += '</tr></thead><tbody><tr>';
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            html += '<td></td>';
        }
        
        // Days of the month
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let dayCount = 1;
        
        for (let i = startingDay; i < 42; i++) {
            if (dayCount > daysInMonth) {
                html += '<td></td>';
                continue;
            }
            
            const currentDate = new Date(year, month, dayCount);
            const isToday = currentDate.toDateString() === today.toDateString();
            const hasBirthday = birthdays.some(b => {
                const bDate = new Date(`${b.date}T12:00:00`);
                return bDate.getDate() === dayCount && bDate.getMonth() === month;
            });
            
            let cellClass = '';
            if (isToday) cellClass = 'today';
            if (hasBirthday) cellClass += ' birthday';
            
            html += `<td class="${cellClass}">${dayCount}</td>`;
            
            if ((i + 1) % 7 === 0 && dayCount < daysInMonth) {
                html += '</tr><tr>';
            }
            
            dayCount++;
        }
        
        html += '</tr></tbody></table>';
        calendar.innerHTML = html;
    }
    
    function showPreviousMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    }
    
    function showNextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    }
});



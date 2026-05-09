// Sample Doctors Data
const doctors = [
    {
        id: 1,
        name: "Dr. John Smith",
        specialty: "General Medicine",
        experience: "15 years",
        avatar: "👨‍⚕️"
    },
    {
        id: 2,
        name: "Dr. Sarah Johnson",
        specialty: "Pediatrics",
        experience: "12 years",
        avatar: "👩‍⚕️"
    },
    {
        id: 3,
        name: "Dr. Michael Brown",
        specialty: "Cardiology",
        experience: "18 years",
        avatar: "👨‍⚕️"
    },
    {
        id: 4,
        name: "Dr. Emily Davis",
        specialty: "Dermatology",
        experience: "10 years",
        avatar: "👩‍⚕️"
    },
    {
        id: 5,
        name: "Dr. Robert Wilson",
        specialty: "Orthopedics",
        experience: "16 years",
        avatar: "👨‍⚕️"
    },
    {
        id: 6,
        name: "Dr. Lisa Anderson",
        specialty: "Neurology",
        experience: "14 years",
        avatar: "👩‍⚕️"
    }
];

// Global Variables
let currentStep = 1;
let selectedDoctor = null;
let selectedDateTime = null;
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDoctors();
    setupNavigation();
    setupDatePicker();
    setupDateChangeListener();
    displayBookings();
});

// Load doctors on home and appointment pages
function loadDoctors() {
    const doctorsList = document.getElementById('doctorsList');
    const doctorSelection = document.getElementById('doctorSelection');

    // Display doctors in doctors section
    if (doctorsList) {
        doctorsList.innerHTML = doctors.map(doctor => `
            <div class="doctor-card">
                <div class="avatar">${doctor.avatar}</div>
                <h3>${doctor.name}</h3>
                <p class="specialty">${doctor.specialty}</p>
                <p class="experience">Experience: ${doctor.experience}</p>
                <button class="btn btn-primary" onclick="scrollToBooking()">Book Now</button>
            </div>
        `).join('');
    }

    // Display doctors in appointment form
    if (doctorSelection) {
        doctorSelection.innerHTML = doctors.map(doctor => `
            <div class="doctor-option" onclick="selectDoctor(${doctor.id})">
                <div class="avatar">${doctor.avatar}</div>
                <div class="name">${doctor.name}</div>
                <div class="specialty">${doctor.specialty}</div>
            </div>
        `).join('');
    }
}

// Setup navigation between sections
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
}

// Switch sections
function switchSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-section') === sectionId) {
            button.classList.add('active');
        }
    });

    // If switching to bookings, refresh the list
    if (sectionId === 'bookings') {
        displayBookings();
    }

    // If switching to appointment, reset form
    if (sectionId === 'appointment') {
        resetAppointmentForm();
    }

    window.scrollTo(0, 0);
}

// Scroll to booking section
function scrollToBooking() {
    switchSection('appointment');
}

// Select doctor
function selectDoctor(doctorId) {
    selectedDoctor = doctorId;
    
    // Update UI
    const doctorOptions = document.querySelectorAll('.doctor-option');
    doctorOptions.forEach(option => option.classList.remove('selected'));
    
    event.target.closest('.doctor-option').classList.add('selected');
}

// Setup date picker - set minimum date to today
function setupDatePicker() {
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

// Setup date change listener to update time slots
function setupDateChangeListener() {
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        dateInput.addEventListener('change', generateTimeSlots);
    }
}

// Generate time slots (10-minute intervals from 9 AM to 5 PM)
function generateTimeSlots() {
    const dateInput = document.getElementById('appointmentDate');
    const selectedDate = dateInput.value;
    
    if (!selectedDate) {
        document.getElementById('timeSlots').innerHTML = '<p style="color: #9ca3af;">Please select a date first</p>';
        return;
    }

    const timeSlots = document.getElementById('timeSlots');
    const slots = [];

    // Generate slots from 9:00 AM to 5:00 PM in 10-minute intervals
    for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
            const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            slots.push(timeString);
        }
    }

    // Check which slots are booked
    const bookedSlots = bookings
        .filter(booking => booking.date === selectedDate && booking.doctorId === selectedDoctor)
        .map(booking => booking.time);

    timeSlots.innerHTML = slots.map(time => {
        const isBooked = bookedSlots.includes(time);
        return `
            <button 
                class="time-slot ${isBooked ? 'unavailable' : ''}" 
                onclick="selectTimeSlot(this, '${time}')"
                ${isBooked ? 'disabled' : ''}>
                ${time}
            </button>
        `;
    }).join('');
}

// Select time slot
function selectTimeSlot(element, time) {
    const timeSlots = document.querySelectorAll('.time-slot:not(.unavailable)');
    timeSlots.forEach(slot => slot.classList.remove('selected'));
    element.classList.add('selected');
    selectedDateTime = {
        date: document.getElementById('appointmentDate').value,
        time: time
    };
}

// Form navigation
function nextStep(currentStepNum) {
    // Validate current step
    if (!validateStep(currentStepNum)) {
        return;
    }

    currentStep = currentStepNum + 1;
    
    if (currentStep === 4) {
        displayConfirmation();
    }

    updateFormDisplay();
    updateProgressBar();
}

function prevStep(currentStepNum) {
    currentStep = currentStepNum - 1;
    updateFormDisplay();
    updateProgressBar();
}

// Validate form steps
function validateStep(stepNum) {
    if (stepNum === 1) {
        const name = document.getElementById('patientName').value.trim();
        const age = document.getElementById('patientAge').value.trim();
        const gender = document.getElementById('patientGender').value.trim();
        const phone = document.getElementById('patientPhone').value.trim();
        const email = document.getElementById('patientEmail').value.trim();

        if (!name || !age || !gender || !phone || !email) {
            alert('Please fill in all patient information fields');
            return false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return false;
        }

        // Validate phone
        const phoneRegex = /^[0-9+\-\s()]{7,}$/;
        if (!phoneRegex.test(phone)) {
            alert('Please enter a valid phone number');
            return false;
        }

        return true;
    } else if (stepNum === 2) {
        if (!selectedDoctor) {
            alert('Please select a doctor');
            return false;
        }
        return true;
    } else if (stepNum === 3) {
        const dateInput = document.getElementById('appointmentDate').value;
        if (!dateInput || !selectedDateTime) {
            alert('Please select both date and time');
            return false;
        }
        return true;
    }
    return true;
}

// Update form display
function updateFormDisplay() {
    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach(step => step.classList.remove('active'));
    document.getElementById(`step${currentStep}`).classList.add('active');
}

// Update progress bar
function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });
}

// Display confirmation
function displayConfirmation() {
    const selectedDoctorObj = doctors.find(d => d.id === selectedDoctor);
    const patientName = document.getElementById('patientName').value;
    const patientAge = document.getElementById('patientAge').value;
    const patientGender = document.getElementById('patientGender').value;
    const patientPhone = document.getElementById('patientPhone').value;
    const patientEmail = document.getElementById('patientEmail').value;
    const appointmentDate = document.getElementById('appointmentDate').value;

    const dateObj = new Date(appointmentDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const confirmationDetails = document.getElementById('confirmationDetails');
    confirmationDetails.innerHTML = `
        <div class="confirmation-item">
            <strong>Patient Name:</strong>
            <span>${patientName}</span>
        </div>
        <div class="confirmation-item">
            <strong>Age:</strong>
            <span>${patientAge}</span>
        </div>
        <div class="confirmation-item">
            <strong>Gender:</strong>
            <span>${patientGender}</span>
        </div>
        <div class="confirmation-item">
            <strong>Phone:</strong>
            <span>${patientPhone}</span>
        </div>
        <div class="confirmation-item">
            <strong>Email:</strong>
            <span>${patientEmail}</span>
        </div>
        <hr style="margin: 15px 0; border: none; border-top: 2px solid var(--border-color);">
        <div class="confirmation-item">
            <strong>Doctor:</strong>
            <span>${selectedDoctorObj.name}</span>
        </div>
        <div class="confirmation-item">
            <strong>Specialty:</strong>
            <span>${selectedDoctorObj.specialty}</span>
        </div>
        <div class="confirmation-item">
            <strong>Date:</strong>
            <span>${formattedDate}</span>
        </div>
        <div class="confirmation-item">
            <strong>Time:</strong>
            <span>${selectedDateTime.time}</span>
        </div>
        <hr style="margin: 15px 0; border: none; border-top: 2px solid var(--border-color);">
        <p style="color: #6b7280; font-size: 0.95em; margin-top: 15px;">
            ✓ Please arrive 10 minutes before your appointment
        </p>
    `;
}

// Complete booking
function completeBooking() {
    const selectedDoctorObj = doctors.find(d => d.id === selectedDoctor);
    const booking = {
        id: Date.now(),
        patientName: document.getElementById('patientName').value,
        patientAge: document.getElementById('patientAge').value,
        patientGender: document.getElementById('patientGender').value,
        patientPhone: document.getElementById('patientPhone').value,
        patientEmail: document.getElementById('patientEmail').value,
        doctorName: selectedDoctorObj.name,
        doctorId: selectedDoctor,
        specialty: selectedDoctorObj.specialty,
        date: document.getElementById('appointmentDate').value,
        time: selectedDateTime.time,
        status: 'Confirmed',
        bookedAt: new Date().toLocaleString()
    };

    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    alert('Appointment booked successfully!');
    resetAppointmentForm();
    switchSection('bookings');
}

// Display bookings
function displayBookings() {
    const bookingsList = document.getElementById('bookingsList');
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<div class="empty-message"><p>No bookings yet. <a href="#" onclick="switchSection(\'appointment\'); return false;">Book an appointment</a></p></div>';
        return;
    }

    bookingsList.innerHTML = bookings.map((booking, index) => {
        const dateObj = new Date(booking.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="booking-item">
                <div class="booking-header">
                    <div>
                        <div class="booking-patient">Appointment #${index + 1}</div>
                        <div style="color: #6b7280; font-size: 0.9em;">Patient: ${booking.patientName}</div>
                    </div>
                    <div class="booking-status status-confirmed">${booking.status}</div>
                </div>
                <div class="booking-details">
                    <div class="detail-item">
                        <div class="detail-label">Doctor</div>
                        <div class="detail-value">${booking.doctorName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Specialty</div>
                        <div class="detail-value">${booking.specialty}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Date</div>
                        <div class="detail-value">${formattedDate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Time</div>
                        <div class="detail-value">${booking.time}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Phone</div>
                        <div class="detail-value">${booking.patientPhone}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email</div>
                        <div class="detail-value" style="word-break: break-all;">${booking.patientEmail}</div>
                    </div>
                </div>
                <button class="btn btn-secondary" onclick="cancelBooking(${booking.id})" style="margin-top: 15px;">Cancel Booking</button>
            </div>
        `;
    }).join('');
}

// Cancel booking
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        bookings = bookings.filter(booking => booking.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        displayBookings();
        alert('Booking cancelled successfully');
    }
}

// Reset appointment form
function resetAppointmentForm() {
    currentStep = 1;
    selectedDoctor = null;
    selectedDateTime = null;

    document.getElementById('patientName').value = '';
    document.getElementById('patientAge').value = '';
    document.getElementById('patientGender').value = '';
    document.getElementById('patientPhone').value = '';
    document.getElementById('patientEmail').value = '';
    document.getElementById('appointmentDate').value = '';
    document.getElementById('timeSlots').innerHTML = '';

    updateFormDisplay();
    updateProgressBar();

    const doctorOptions = document.querySelectorAll('.doctor-option');
    doctorOptions.forEach(option => option.classList.remove('selected'));
}

// Initialize progress bar display
updateProgressBar();

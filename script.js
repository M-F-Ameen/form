// إضافة اللوجو الفعلي
document.addEventListener('DOMContentLoaded', function() {
    const logoImg = document.getElementById('companyLogo');
    logoImg.src = 'data:image/png;base64,' + 'BASE64_LOGO_HERE'; // استبدل هذا بالـ base64 للوجو
    logoImg.onerror = function() {
        this.style.display = 'none';
    };
});

const form = document.getElementById('jobApplicationForm');
const submitBtn = document.getElementById('submitBtn');
const loading = document.getElementById('loading');
const successAlert = document.getElementById('successAlert');
const errorAlert = document.getElementById('errorAlert');
const fileInput = document.getElementById('resume');
const fileLabel = document.querySelector('.file-upload-label');
const fileUploadContainer = document.getElementById('fileUploadContainer');
const jobFields = document.getElementById('jobFields');
const jobRadio = document.getElementById('job');
const internshipRadio = document.getElementById('internship');

// Backend API URL - dynamic for development and production
const API_URL = window.location.origin + '/api/applications';

// إظهار/إخفاء الحقول الإضافية عند اختيار نوع التقديم
function toggleJobFields() {
    const expectedSalary = document.getElementById('expectedSalary');
    const availabilityDate = document.getElementById('availabilityDate');
    
    if (jobRadio.checked) {
        jobFields.classList.add('show');
        expectedSalary.required = true;
        availabilityDate.required = true;
    } else {
        jobFields.classList.remove('show');
        expectedSalary.required = false;
        availabilityDate.required = false;
        expectedSalary.value = '';
        availabilityDate.value = '';
    }
}

// إضافة مستمعي الأحداث لأزرار الراديو
jobRadio.addEventListener('change', toggleJobFields);
internshipRadio.addEventListener('change', toggleJobFields);

// معالجة تغيير اسم الملف
fileInput.addEventListener('change', function() {
    const fileName = this.files[0]?.name;
    if (fileName) {
        fileLabel.innerHTML = `📎 تم اختيار: <strong>${fileName}</strong>`;
        fileLabel.style.color = '#2c5234';
        fileUploadContainer.classList.add('has-file');
        fileUploadContainer.classList.remove('required');
    } else {
        fileLabel.innerHTML = '📎 اضغط لاختيار السيرة الذاتية (PDF, DOC, DOCX)';
        fileUploadContainer.classList.remove('has-file');
        fileUploadContainer.classList.add('required');
    }
});

// معالجة إرسال النموذج
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // التحقق من رفع السيرة الذاتية
    if (!fileInput.files[0]) {
        errorAlert.style.display = 'block';
        errorAlert.textContent = '❌ يرجى رفع السيرة الذاتية قبل الإرسال';
        errorAlert.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // إخفاء الرسائل السابقة
    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';
    
    // عرض مؤشر التحميل
    loading.style.display = 'block';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ جاري الإرسال...';

    try {
        // جمع بيانات النموذج
        const formData = new FormData();
        
        formData.append('fullName', document.getElementById('fullName').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('phone', document.getElementById('phone').value);
        formData.append('major', document.getElementById('major').value);
        formData.append('graduationYear', document.getElementById('graduationYear').value);
        formData.append('governorate', document.getElementById('governorate').value);
        formData.append('applicationType', document.querySelector('input[name="applicationType"]:checked').value);
        formData.append('skills', document.getElementById('skills').value);
        formData.append('timestamp', new Date().toLocaleString('ar-EG'));
        
        // إضافة البيانات الإضافية للوظائف
        if (jobRadio.checked) {
            formData.append('expectedSalary', document.getElementById('expectedSalary').value);
            formData.append('availabilityDate', document.getElementById('availabilityDate').value);
        } else {
            formData.append('expectedSalary', '');
            formData.append('availabilityDate', '');
        }
        
        // إضافة السيرة الذاتية (مطلوبة الآن)
        const resumeFile = fileInput.files[0];
        formData.append('resume', resumeFile);

        // إرسال البيانات إلى Backend API
        const response = await fetch(`${API_URL}/submit`, {
            method: 'POST',
            body: formData // Send FormData instead of JSON
        });

        const result = await response.json();

        if (result.success) {
            showSuccessPopup(); // Show success popup instead of alert
            form.reset();
            toggleJobFields(); // إخفاء الحقول الإضافية بعد الإرسال
            fileLabel.innerHTML = '📎 اضغط لاختيار السيرة الذاتية (PDF, DOC, DOCX)';
            fileUploadContainer.classList.remove('has-file');
            fileUploadContainer.classList.add('required');
            
            // Remove the scroll to success alert since we're using popup now
        } else {
            throw new Error(result.error || 'حدث خطأ غير محدد');
        }

    } catch (error) {
        console.error('Error:', error);
        errorAlert.style.display = 'block';
        errorAlert.textContent = `❌ حدث خطأ: ${error.message}`;
        errorAlert.scrollIntoView({ behavior: 'smooth' });
    } finally {
        // إخفاء مؤشر التحميل وإعادة تفعيل الزر
        loading.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '🚀 إرسال الطلب';
    }
});

// التحقق من صحة البريد الإلكتروني
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        this.style.borderColor = '#dc3545';
    } else {
        this.style.borderColor = '#6abd45';
    }
});

// التحقق من رقم الهاتف
document.getElementById('phone').addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9+]/g, '');
});

// تحديد الحد الأدنى لتاريخ الاستعداد للعمل (اليوم)
document.getElementById('availabilityDate').min = new Date().toISOString().split('T')[0];

// تحسين تفاعل النموذج
const inputs = document.querySelectorAll('input, select, textarea');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Admin Panel Password Protection
const adminLink = document.getElementById('adminLink');
const passwordModal = document.getElementById('passwordModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const loginBtn = document.getElementById('loginBtn');
const adminPassword = document.getElementById('adminPassword');
const passwordError = document.getElementById('passwordError');

function getAdminPanelPassword() {
    return localStorage.getItem('ADMIN_PANEL_PASSWORD') || '12345';
}

// Show password modal when admin link is clicked
adminLink.addEventListener('click', function(e) {
    e.preventDefault();
    passwordModal.style.display = 'block';
    adminPassword.focus();
    passwordError.style.display = 'none';
    adminPassword.value = '';
});

// Close modal functions
function closePasswordModal() {
    passwordModal.style.display = 'none';
    adminPassword.value = '';
    passwordError.style.display = 'none';
}

closeModal.addEventListener('click', closePasswordModal);
cancelBtn.addEventListener('click', closePasswordModal);

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === passwordModal) {
        closePasswordModal();
    }
});

// Handle login
loginBtn.addEventListener('click', function() {
    const enteredPassword = adminPassword.value;
    if (enteredPassword === getAdminPanelPassword()) {
        // Password correct - redirect to admin panel
        window.location.href = '/admin';
    } else {
        // Password incorrect - show error
        passwordError.style.display = 'block';
        adminPassword.value = '';
        adminPassword.focus();
    }
});

// Handle Enter key in password field
adminPassword.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
}); 

// Success Popup Functions
function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.style.display = 'block';
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
        hideSuccessPopup();
    }, 2000);
}

function hideSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.style.display = 'none';
} 
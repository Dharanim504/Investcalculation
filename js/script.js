// Global variables
let currentMode = 'sip';
const USD_EXCHANGE_RATE = 0.012; // Static exchange rate (1 INR = 0.012 USD)

// DOM elements
const themeToggle = document.getElementById('themeToggle');
const modeButtons = document.querySelectorAll('.mode-btn');
const calculators = document.querySelectorAll('.calculator');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeModeSelector();
    initializeCalculators();
    initializeEventListeners();
});

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Mode selector
function initializeModeSelector() {
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            switchMode(mode);
        });
    });
}

function switchMode(mode) {
    // Update active button
    modeButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Update active calculator
    calculators.forEach(calc => calc.classList.remove('active'));
    document.getElementById(`${mode}-calculator`).classList.add('active');
    
    currentMode = mode;
    
    // Hide all results
    document.querySelectorAll('.results-section').forEach(section => {
        section.classList.add('hidden');
    });
}

// Initialize calculators
function initializeCalculators() {
    // SIP Calculator
    const sipCalculate = document.getElementById('sip-calculate');
    const sipReset = document.getElementById('sip-reset');
    
    sipCalculate.addEventListener('click', () => calculateSIP());
    sipReset.addEventListener('click', () => resetCalculator('sip'));
    
    // Annual Increase SIP Calculator
    const annualCalculate = document.getElementById('annual-calculate');
    const annualReset = document.getElementById('annual-reset');
    
    annualCalculate.addEventListener('click', () => calculateAnnualIncreaseSIP());
    annualReset.addEventListener('click', () => resetCalculator('annual'));
    
    // Lump Sum Calculator
    const lumpsumCalculate = document.getElementById('lumpsum-calculate');
    const lumpsumReset = document.getElementById('lumpsum-reset');
    
    lumpsumCalculate.addEventListener('click', () => calculateLumpSum());
    lumpsumReset.addEventListener('click', () => resetCalculator('lumpsum'));
}

// Event listeners
function initializeEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add input validation
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', validateInput);
        input.addEventListener('blur', validateInput);
    });
}

// Input validation
function validateInput(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    
    input.classList.remove('error', 'success');
    
    if (input.value === '') {
        input.classList.add('error');
        return false;
    }
    
    if (value < 0) {
        input.classList.add('error');
        return false;
    }
    
    // Specific validation for rates
    if (input.id.includes('rate') && value > 100) {
        input.classList.add('error');
        return false;
    }
    
    // Specific validation for duration
    if (input.id.includes('duration') && (value < 1 || value > 50)) {
        input.classList.add('error');
        return false;
    }
    
    input.classList.add('success');
    return true;
}

// Number formatting utilities
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatUSD(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    function convertLessThanOneThousand(n) {
        if (n === 0) return '';
        
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) {
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        }
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
    }
    
    function convert(n) {
        if (n === 0) return 'Zero';
        
        const crore = Math.floor(n / 10000000);
        const lakh = Math.floor((n % 10000000) / 100000);
        const thousand = Math.floor((n % 100000) / 1000);
        const remainder = n % 1000;
        
        let result = '';
        
        if (crore > 0) {
            result += convertLessThanOneThousand(crore) + ' Crore';
        }
        
        if (lakh > 0) {
            result += (result ? ' ' : '') + convertLessThanOneThousand(lakh) + ' Lakh';
        }
        
        if (thousand > 0) {
            result += (result ? ' ' : '') + convertLessThanOneThousand(thousand) + ' Thousand';
        }
        
        if (remainder > 0) {
            result += (result ? ' ' : '') + convertLessThanOneThousand(remainder);
        }
        
        return result + ' Rupees';
    }
    
    return convert(Math.floor(num));
}

function numberToUSDWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    function convertLessThanOneThousand(n) {
        if (n === 0) return '';
        
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) {
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        }
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
    }
    
    function convert(n) {
        if (n === 0) return 'Zero';
        
        const billion = Math.floor(n / 1000000000);
        const million = Math.floor((n % 1000000000) / 1000000);
        const thousand = Math.floor((n % 1000000) / 1000);
        const remainder = n % 1000;
        
        let result = '';
        
        if (billion > 0) {
            result += convertLessThanOneThousand(billion) + ' Billion';
        }
        
        if (million > 0) {
            result += (result ? ' ' : '') + convertLessThanOneThousand(million) + ' Million';
        }
        
        if (thousand > 0) {
            result += (result ? ' ' : '') + convertLessThanOneThousand(thousand) + ' Thousand';
        }
        
        if (remainder > 0) {
            result += (result ? ' ' : '') + convertLessThanOneThousand(remainder);
        }
        
        return result + ' Dollars';
    }
    
    return convert(Math.floor(num));
}

// SIP Calculator
function calculateSIP() {
    const amount = parseFloat(document.getElementById('sip-amount').value);
    const rate = parseFloat(document.getElementById('sip-rate').value);
    const duration = parseInt(document.getElementById('sip-duration').value);
    
    if (!validateSIPInputs(amount, rate, duration)) return;
    
    const monthlyRate = rate / 100 / 12;
    const totalMonths = duration * 12;
    
    // SIP Formula: FV = P × [(1 + r)^n – 1] × (1 + r) / r
    const maturityValue = amount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) * (1 + monthlyRate)) / monthlyRate;
    const totalInvested = amount * totalMonths;
    const profitEarned = maturityValue - totalInvested;
    
    displaySIPResults(totalInvested, maturityValue, profitEarned);
    generateSIPBreakdown(amount, rate, duration);
}

function validateSIPInputs(amount, rate, duration) {
    if (!amount || !rate || !duration) {
        showError('Please fill in all fields');
        return false;
    }
    
    if (amount <= 0 || rate <= 0 || duration <= 0) {
        showError('All values must be positive');
        return false;
    }
    
    return true;
}

function displaySIPResults(totalInvested, maturityValue, profitEarned) {
    const resultsSection = document.getElementById('sip-results');
    resultsSection.classList.remove('hidden');
    
    // Update KPI cards
    document.getElementById('sip-total-invested').textContent = formatINR(totalInvested);
    document.getElementById('sip-total-invested-words').textContent = numberToWords(totalInvested);
    document.getElementById('sip-total-invested-usd').textContent = formatUSD(totalInvested * USD_EXCHANGE_RATE);
    
    document.getElementById('sip-maturity-value').textContent = formatINR(maturityValue);
    document.getElementById('sip-maturity-value-words').textContent = numberToWords(maturityValue);
    document.getElementById('sip-maturity-value-usd').textContent = formatUSD(maturityValue * USD_EXCHANGE_RATE);
    
    document.getElementById('sip-profit-earned').textContent = formatINR(profitEarned);
    document.getElementById('sip-profit-earned-words').textContent = numberToWords(profitEarned);
    document.getElementById('sip-profit-earned-usd').textContent = formatUSD(profitEarned * USD_EXCHANGE_RATE);
}

function generateSIPBreakdown(amount, rate, duration) {
    const breakdownContainer = document.getElementById('sip-breakdown');
    breakdownContainer.innerHTML = '';
    
    const monthlyRate = rate / 100 / 12;
    let runningBalance = 0;
    
    for (let year = 1; year <= duration; year++) {
        const yearStartBalance = runningBalance;
        let yearInterest = 0;
        
        // Calculate monthly breakdown for this year
        const monthDetails = [];
        for (let month = 1; month <= 12; month++) {
            const monthInterest = (runningBalance + amount) * monthlyRate;
            runningBalance += amount + monthInterest;
            yearInterest += monthInterest;
            
            monthDetails.push({
                month: month,
                investment: amount,
                interest: monthInterest,
                balance: runningBalance
            });
        }
        
        const yearItem = createYearItem(year, yearStartBalance, amount * 12, yearInterest, runningBalance, monthDetails);
        breakdownContainer.appendChild(yearItem);
    }
}

// Annual Increase SIP Calculator
function calculateAnnualIncreaseSIP() {
    const initialAmount = parseFloat(document.getElementById('annual-initial-amount').value);
    const rate = parseFloat(document.getElementById('annual-rate').value);
    const duration = parseInt(document.getElementById('annual-duration').value);
    const increaseRate = parseFloat(document.getElementById('annual-increase-rate').value);
    
    if (!validateAnnualInputs(initialAmount, rate, duration, increaseRate)) return;
    
    const monthlyRate = rate / 100 / 12;
    const annualIncreaseFactor = 1 + (increaseRate / 100);
    let runningBalance = 0;
    let totalInvested = 0;
    let currentMonthlyAmount = initialAmount;
    
    for (let year = 1; year <= duration; year++) {
        for (let month = 1; month <= 12; month++) {
            const monthInterest = (runningBalance + currentMonthlyAmount) * monthlyRate;
            runningBalance += currentMonthlyAmount + monthInterest;
            totalInvested += currentMonthlyAmount;
        }
        currentMonthlyAmount *= annualIncreaseFactor;
    }
    
    const profitEarned = runningBalance - totalInvested;
    
    displayAnnualResults(totalInvested, runningBalance, profitEarned);
    generateAnnualBreakdown(initialAmount, rate, duration, increaseRate);
}

function validateAnnualInputs(initialAmount, rate, duration, increaseRate) {
    if (!initialAmount || !rate || !duration || !increaseRate) {
        showError('Please fill in all fields');
        return false;
    }
    
    if (initialAmount <= 0 || rate <= 0 || duration <= 0 || increaseRate < 0) {
        showError('All values must be positive');
        return false;
    }
    
    return true;
}

function displayAnnualResults(totalInvested, maturityValue, profitEarned) {
    const resultsSection = document.getElementById('annual-results');
    resultsSection.classList.remove('hidden');
    
    document.getElementById('annual-total-invested').textContent = formatINR(totalInvested);
    document.getElementById('annual-total-invested-words').textContent = numberToWords(totalInvested);
    document.getElementById('annual-total-invested-usd').textContent = formatUSD(totalInvested * USD_EXCHANGE_RATE);
    
    document.getElementById('annual-maturity-value').textContent = formatINR(maturityValue);
    document.getElementById('annual-maturity-value-words').textContent = numberToWords(maturityValue);
    document.getElementById('annual-maturity-value-usd').textContent = formatUSD(maturityValue * USD_EXCHANGE_RATE);
    
    document.getElementById('annual-profit-earned').textContent = formatINR(profitEarned);
    document.getElementById('annual-profit-earned-words').textContent = numberToWords(profitEarned);
    document.getElementById('annual-profit-earned-usd').textContent = formatUSD(profitEarned * USD_EXCHANGE_RATE);
}

function generateAnnualBreakdown(initialAmount, rate, duration, increaseRate) {
    const breakdownContainer = document.getElementById('annual-breakdown');
    breakdownContainer.innerHTML = '';
    
    const monthlyRate = rate / 100 / 12;
    const annualIncreaseFactor = 1 + (increaseRate / 100);
    let runningBalance = 0;
    let currentMonthlyAmount = initialAmount;
    
    for (let year = 1; year <= duration; year++) {
        const yearStartBalance = runningBalance;
        const yearStartSIP = currentMonthlyAmount;
        let yearInterest = 0;
        let yearInvestment = 0;
        
        const monthDetails = [];
        for (let month = 1; month <= 12; month++) {
            const monthInterest = (runningBalance + currentMonthlyAmount) * monthlyRate;
            runningBalance += currentMonthlyAmount + monthInterest;
            yearInterest += monthInterest;
            yearInvestment += currentMonthlyAmount;
            
            monthDetails.push({
                month: month,
                investment: currentMonthlyAmount,
                interest: monthInterest,
                balance: runningBalance
            });
        }
        
        const yearItem = createAnnualYearItem(year, yearStartBalance, yearStartSIP, currentMonthlyAmount, yearInvestment, yearInterest, runningBalance, monthDetails);
        breakdownContainer.appendChild(yearItem);
        
        currentMonthlyAmount *= annualIncreaseFactor;
    }
}

// Lump Sum Calculator
function calculateLumpSum() {
    const amount = parseFloat(document.getElementById('lumpsum-amount').value);
    const rate = parseFloat(document.getElementById('lumpsum-rate').value);
    const duration = parseInt(document.getElementById('lumpsum-duration').value);
    
    if (!validateLumpSumInputs(amount, rate, duration)) return;
    
    // Compound Interest Formula: FV = P × (1 + r)^t
    const finalValue = amount * Math.pow(1 + rate / 100, duration);
    const profitEarned = finalValue - amount;
    
    displayLumpSumResults(amount, finalValue, profitEarned);
    generateLumpSumBreakdown(amount, rate, duration);
}

function validateLumpSumInputs(amount, rate, duration) {
    if (!amount || !rate || !duration) {
        showError('Please fill in all fields');
        return false;
    }
    
    if (amount <= 0 || rate <= 0 || duration <= 0) {
        showError('All values must be positive');
        return false;
    }
    
    return true;
}

function displayLumpSumResults(totalInvested, finalValue, profitEarned) {
    const resultsSection = document.getElementById('lumpsum-results');
    resultsSection.classList.remove('hidden');
    
    document.getElementById('lumpsum-total-invested').textContent = formatINR(totalInvested);
    document.getElementById('lumpsum-total-invested-words').textContent = numberToWords(totalInvested);
    document.getElementById('lumpsum-total-invested-usd').textContent = formatUSD(totalInvested * USD_EXCHANGE_RATE);
    
    document.getElementById('lumpsum-final-value').textContent = formatINR(finalValue);
    document.getElementById('lumpsum-final-value-words').textContent = numberToWords(finalValue);
    document.getElementById('lumpsum-final-value-usd').textContent = formatUSD(finalValue * USD_EXCHANGE_RATE);
    
    document.getElementById('lumpsum-profit-earned').textContent = formatINR(profitEarned);
    document.getElementById('lumpsum-profit-earned-words').textContent = numberToWords(profitEarned);
    document.getElementById('lumpsum-profit-earned-usd').textContent = formatUSD(profitEarned * USD_EXCHANGE_RATE);
}

function generateLumpSumBreakdown(amount, rate, duration) {
    const breakdownContainer = document.getElementById('lumpsum-breakdown');
    breakdownContainer.innerHTML = '';
    
    let runningBalance = amount;
    
    for (let year = 1; year <= duration; year++) {
        const yearStartBalance = runningBalance;
        const yearInterest = runningBalance * (rate / 100);
        runningBalance += yearInterest;
        
        const yearItem = createLumpSumYearItem(year, yearStartBalance, yearInterest, runningBalance);
        breakdownContainer.appendChild(yearItem);
    }
}

// Create year breakdown items
function createYearItem(year, startBalance, investment, interest, endBalance, monthDetails) {
    const yearItem = document.createElement('div');
    yearItem.className = 'year-item';
    
    const yearHeader = document.createElement('div');
    yearHeader.className = 'year-header';
    yearHeader.innerHTML = `
        <div>
            <div class="year-title">Year ${year}</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                Investment: ${formatINR(investment)} | Interest: ${formatINR(interest)}
            </div>
        </div>
        <div>
            <div class="year-amount">${formatINR(endBalance)}</div>
            <i class="fas fa-chevron-down year-toggle"></i>
        </div>
    `;
    
    const monthDetailsDiv = document.createElement('div');
    monthDetailsDiv.className = 'month-details';
    
    const monthList = document.createElement('div');
    monthList.className = 'month-list';
    
    monthDetails.forEach(month => {
        const monthItem = document.createElement('div');
        monthItem.className = 'month-item';
        monthItem.innerHTML = `
            <span class="month-name">Month ${month.month}</span>
            <span class="month-amount">${formatINR(month.balance)}</span>
        `;
        monthList.appendChild(monthItem);
    });
    
    monthDetailsDiv.appendChild(monthList);
    yearItem.appendChild(yearHeader);
    yearItem.appendChild(monthDetailsDiv);
    
    yearHeader.addEventListener('click', () => {
        yearItem.classList.toggle('expanded');
    });
    
    return yearItem;
}

function createAnnualYearItem(year, startBalance, startSIP, endSIP, investment, interest, endBalance, monthDetails) {
    const yearItem = document.createElement('div');
    yearItem.className = 'year-item';
    
    const yearHeader = document.createElement('div');
    yearHeader.className = 'year-header';
    yearHeader.innerHTML = `
        <div>
            <div class="year-title">Year ${year}</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                SIP: ${formatINR(startSIP)} → ${formatINR(endSIP)} | Interest: ${formatINR(interest)}
            </div>
        </div>
        <div>
            <div class="year-amount">${formatINR(endBalance)}</div>
            <i class="fas fa-chevron-down year-toggle"></i>
        </div>
    `;
    
    const monthDetailsDiv = document.createElement('div');
    monthDetailsDiv.className = 'month-details';
    
    const monthList = document.createElement('div');
    monthList.className = 'month-list';
    
    monthDetails.forEach(month => {
        const monthItem = document.createElement('div');
        monthItem.className = 'month-item';
        monthItem.innerHTML = `
            <span class="month-name">Month ${month.month}</span>
            <span class="month-amount">${formatINR(month.balance)}</span>
        `;
        monthList.appendChild(monthItem);
    });
    
    monthDetailsDiv.appendChild(monthList);
    yearItem.appendChild(yearHeader);
    yearItem.appendChild(monthDetailsDiv);
    
    yearHeader.addEventListener('click', () => {
        yearItem.classList.toggle('expanded');
    });
    
    return yearItem;
}

function createLumpSumYearItem(year, startBalance, interest, endBalance) {
    const yearItem = document.createElement('div');
    yearItem.className = 'year-item';
    
    const yearHeader = document.createElement('div');
    yearHeader.className = 'year-header';
    yearHeader.innerHTML = `
        <div>
            <div class="year-title">Year ${year}</div>
            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                Interest Earned: ${formatINR(interest)}
            </div>
        </div>
        <div>
            <div class="year-amount">${formatINR(endBalance)}</div>
            <i class="fas fa-chevron-down year-toggle"></i>
        </div>
    `;
    
    const monthDetailsDiv = document.createElement('div');
    monthDetailsDiv.className = 'month-details';
    
    const monthList = document.createElement('div');
    monthList.className = 'month-list';
    
    // For lump sum, show quarterly breakdown
    const quarterlyRate = (interest / startBalance) / 4;
    let quarterlyBalance = startBalance;
    
    for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterlyInterest = quarterlyBalance * quarterlyRate;
        quarterlyBalance += quarterlyInterest;
        
        const monthItem = document.createElement('div');
        monthItem.className = 'month-item';
        monthItem.innerHTML = `
            <span class="month-name">Q${quarter}</span>
            <span class="month-amount">${formatINR(quarterlyBalance)}</span>
        `;
        monthList.appendChild(monthItem);
    }
    
    monthDetailsDiv.appendChild(monthList);
    yearItem.appendChild(yearHeader);
    yearItem.appendChild(monthDetailsDiv);
    
    yearHeader.addEventListener('click', () => {
        yearItem.classList.toggle('expanded');
    });
    
    return yearItem;
}

// Reset functions
function resetCalculator(mode) {
    const calculator = document.getElementById(`${mode}-calculator`);
    const inputs = calculator.querySelectorAll('input');
    const results = document.getElementById(`${mode}-results`);
    
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('error', 'success');
    });
    
    results.classList.add('hidden');
}

// Error handling
function showError(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger-color);
        color: white;
        padding: 1rem;
        border-radius: var(--radius-md);
        z-index: 1000;
        box-shadow: var(--shadow-lg);
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
} 
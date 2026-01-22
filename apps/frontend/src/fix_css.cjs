
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'App.css');
console.log('Reading:', filePath);
const content = fs.readFileSync(filePath, 'utf8');

const marker = '.membership-content';
const lastIndex = content.lastIndexOf(marker);

if (lastIndex === -1) {
    console.error('Marker not found');
    process.exit(1);
}

const closingBraceIndex = content.indexOf('}', lastIndex);

if (closingBraceIndex === -1) {
    console.error('Closing brace not found');
    process.exit(1);
}

const cleanContent = content.substring(0, closingBraceIndex + 1);

const newStyles = `

/* ===============================
   Contact Section Motif & Enhancements
================================== */
.contact-section {
  position: relative;
  background-color: var(--light);
  padding: 5rem 0;
  overflow: hidden;
}

/* Islamic Geometric Pattern Overlay */
.contact-section::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23047857' stroke-width='0.5' opacity='1'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z'/%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3Cpath d='M30 15 L45 30 L30 45 L15 30 Z'/%3E%3Cpath d='M0 0 L60 60 M60 0 L0 60' stroke-dasharray='2 4'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 60px 60px;
  background-repeat: repeat;
  z-index: 0;
  pointer-events: none;
}

/* Ensure content sits on top of the pattern */
.contact-section .section-container {
  position: relative;
  z-index: 2;
}

/* Add a gradient fade at the top for smooth transition */
.contact-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to bottom, var(--white), transparent);
  z-index: 1;
  pointer-events: none;
}

/* Enhancing Contact Cards to pop against the pattern */
.contact-info .contact-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(255, 255, 255, 0.5);
  margin-bottom: 1rem;
  transition: var(--transition);
}

.contact-info .contact-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
  background: white;
}

.contact-map iframe {
  box-shadow: var(--shadow-md);
  border: 4px solid white !important;
}

.feedback-form-container {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(0, 0, 0, 0.05);
}
`;

fs.writeFileSync(filePath, cleanContent + newStyles, 'utf8');
console.log('App.css successfully updated');

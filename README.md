# 🇵🇰 Mera Pakistan – SQA & Test Automation

A Software Quality Assurance and Test Automation project focused on validating the functionality and reliability of the Mera Pakistan web application using Python and Pytest.

## 🎯 Project Overview

Mera Pakistan is a full-stack cultural and heritage exploration platform that showcases Pakistan's historical landmarks, regional traditions, and culinary heritage.

This repository focuses on software testing practices, test organization, and automation techniques to evaluate application behavior and validate important application components.

## 🧪 Testing Areas

This project includes the following testing modules:

- **Single Page Testing:** Validates individual application pages and their expected behavior.
- **Page Object Model (POM) Testing:** Uses a structured approach to organize page elements, locators, and reusable interactions.
- **Unit/API Testing:** Contains tests for application components and API-related behavior, as implemented in the test suite.

## 🛠️ Technology Stack

| Category | Tools & Technologies |
|---|---|
| Programming Language | Python |
| Testing Framework | Pytest |
| Browser Automation | Selenium WebDriver |
| Design Pattern | Page Object Model (POM) |
| API Testing | Python Requests (if used) |
| Version Control | Git & GitHub |

## 📁 Project Structure

```text
Mera-Pakistan/
│
├── tests/
│   ├── config.py
│   ├── conftest.py
│   ├── pages.py
│   ├── test_single_page.py
│   ├── test_pom.py
│   ├── test_unit.py
│   ├── test_functional.py
│   ├── test_integration.py
│   ├── test_uat.py
│   └── run_all_tests.bat
│
├── artifacts/
├── lib/
├── scripts/
│
├── package.json
└── pnpm-workspace.yaml
```

## ⚙️ Setup & Installation

**1. Clone the repository**

```bash
git clone https://github.com/saadullah684/SQA-Automation-Testing-Mera-Pakistan-.git
```

**2. Navigate to the project directory**

```bash
cd SQA-Automation-Testing-Mera-Pakistan-
```

**3. Install Python testing dependencies**

```bash
pip install pytest selenium requests
```

**4. Install application dependencies**

```bash
pnpm install
```

**5. Configure environment variables**

Configure the required application settings using the provided `.env.example` file, if available.

**6. Run the application**

```bash
pnpm dev
```

## ▶️ Running Tests

Navigate to the testing directory:

```bash
cd tests
```

Run all Pytest test cases:

```bash
pytest -v
```

Run individual testing modules:

```bash
pytest test_single_page.py -v
pytest test_pom.py -v
pytest test_unit.py -v
```

## 📌 Project Objectives

- Practice software testing methodologies.
- Validate application functionality and expected behavior.
- Develop reusable automation test scripts.
- Understand Pytest test organization and execution.
- Apply the Page Object Model design pattern.
- Improve software quality through systematic testing.

## 👨‍💻 Project Credits

**Original Application Developer:** Rayyan Wamiq

**SQA & Test Automation Repository:** Saad Ullah

This repository is maintained for software quality assurance learning, testing practice, and portfolio demonstration. Original application development credit belongs to the respective developer.

---

👨‍💻 Author

Saad Ullah
Software Engineering Student | SQA & Test Automation Enthusiast

GitHub: https://github.com/saadullah684

LinkedIn: https://www.linkedin.com/in/saad-ullah-8b4415409/

Email: usaad8104@gmail.com

Project: Mera Pakistan – SQA & Test Automation

**Focus Areas:** Software Quality Assurance | Python | Pytest | Selenium | Test Automation | POM

🇵🇰 *Mera Pakistan – Exploring the culture and heritage of Pakistan.*

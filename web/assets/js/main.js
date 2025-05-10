/**
* Template Name: iLanding
* Template URL: https://bootstrapmade.com/ilanding-bootstrap-landing-page-template/
* Updated: Nov 12 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();


document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#analysisTable tbody");
  const addRowButton = document.getElementById("addRow");

  // Event listener for adding a row
  addRowButton.addEventListener("click", function () {
      addRow();
  });

  // Function to add a new row
  function addRow(data = {}) {
      const newRow = tableBody.insertRow();
      const cols = ["emergencyType", "probability", "humanImpact", "propertyImpact", "businessImpact", "internalResources", "externalResources"];

      cols.forEach(col => {
          const cell = newRow.insertCell();
          const input = document.createElement("input");
          input.type = col === "emergencyType" ? "text" : "number";
          input.className = col;
          input.value = data[col] || "";
          if (input.type === "number") {
              input.min = 1;
              input.max = 5;
          }
          input.addEventListener("input", () => calculateTotal(newRow));
          cell.appendChild(input);
      });

      // Total score column
      const totalCell = newRow.insertCell();
      totalCell.className = "total";
      totalCell.textContent = "0";

      // Action buttons column
      const actionCell = newRow.insertCell();
      actionCell.appendChild(createButton("↑", "moveUp", () => moveRow(newRow, -1)));
      actionCell.appendChild(createButton("↓", "moveDown", () => moveRow(newRow, 1)));
      actionCell.appendChild(createButton("❌", "deleteRow", () => deleteRow(newRow)));

      calculateTotal(newRow);
      saveData();
  }

  // Function to create buttons
  function createButton(text, className, onClick) {
      const button = document.createElement("button");
      button.textContent = text;
      button.className = className;
      button.addEventListener("click", onClick);
      return button;
  }

  // Function to calculate the total score for a row
  function calculateTotal(row) {
      const inputs = row.querySelectorAll("input[type='number']");
      const probability = parseFloat(inputs[0].value) || 0; // Probability is the first input
      let sum = 0;
      let count = 0;

      // Calculate the average of Human Impact, Property Impact, Business Impact, Internal Resources, External Resources
      for (let i = 1; i < inputs.length; i++) {
          const value = parseFloat(inputs[i].value);
          if (!isNaN(value)) {
              sum += value;
              count++;
          }
      }

      const average = count > 0 ? sum / count : 0;
      const total = probability * average;

      row.querySelector(".total").textContent = total.toFixed(2);
      saveData();
  }

  // Function to move a row up or down
  function moveRow(row, direction) {
      const index = Array.from(tableBody.rows).indexOf(row);
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < tableBody.rows.length) {
          tableBody.insertBefore(row, direction === -1 ? tableBody.rows[newIndex] : tableBody.rows[newIndex].nextSibling);
          saveData();
      }
  }

  // Function to delete a row
  function deleteRow(row) {
      row.remove();
      saveData();
  }

  // Function to save data in local storage
  function saveData() {
      const data = Array.from(tableBody.rows).map(row => {
          return {
              emergencyType: row.querySelector(".emergencyType").value,
              probability: row.querySelector(".probability").value,
              humanImpact: row.querySelector(".humanImpact").value,
              propertyImpact: row.querySelector(".propertyImpact").value,
              businessImpact: row.querySelector(".businessImpact").value,
              internalResources: row.querySelector(".internalResources").value,
              externalResources: row.querySelector(".externalResources").value
          };
      });
      localStorage.setItem("tableData", JSON.stringify(data));
  }

  // Function to load saved data
  function loadData() {
      const storedData = JSON.parse(localStorage.getItem("tableData")) || [];
      storedData.forEach(addRow);
  }

  loadData(); // Load table data on page load
});



document.addEventListener('DOMContentLoaded', function () {
  loadData();
  document.getElementById('addEquipment').addEventListener('click', addEquipment);
});

function addEquipment() {
  var equipmentId = document.getElementById('equipmentId').value;
  var equipmentName = document.getElementById('equipmentName').value;
  var location = document.getElementById('location').value;
  var serviceHistory = document.getElementById('serviceHistory').value;
  var status = document.getElementById('status').value;

  if (equipmentId && equipmentName && location && serviceHistory && status) {
      var table = document.getElementById('equipmentTable').getElementsByTagName('tbody')[0];
      var newRow = table.insertRow(table.rows.length);

      var cols = [equipmentId, equipmentName, location, serviceHistory, status];

      cols.forEach(function (col) {
          var cell = newRow.insertCell();
          cell.textContent = col;
      });

      var actionCell = newRow.insertCell();
      var editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.className = "edit";
      editButton.addEventListener('click', function () {
          editEquipment(newRow);
      });
      actionCell.appendChild(editButton);

      var deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete";
      deleteButton.addEventListener('click', function () {
          deleteEquipment(newRow);
      });
      actionCell.appendChild(deleteButton);

      saveData();
      clearForm();
  } else {
      alert("Please fill all fields.");
  }
}

function editEquipment(row) {
  var cells = row.getElementsByTagName('td');
  document.getElementById('equipmentId').value = cells[0].textContent;
  document.getElementById('equipmentName').value = cells[1].textContent;
  document.getElementById('location').value = cells[2].textContent;
  document.getElementById('serviceHistory').value = cells[3].textContent;
  document.getElementById('status').value = cells[4].textContent;

  row.remove();
  saveData();
}

function deleteEquipment(row) {
  row.remove();
  saveData();
}

function clearForm() {
  document.getElementById('equipmentId').value = '';
  document.getElementById('equipmentName').value = '';
  document.getElementById('location').value = '';
  document.getElementById('serviceHistory').value = '';
  document.getElementById('status').value = 'Operational';
}

function saveData() {
  var table = document.getElementById('equipmentTable');
  var data = [];
  Array.from(table.getElementsByTagName('tr')).forEach(function (row, index) {
      if (index === 0) return; // Skip header
      var rowData = {};
      Array.from(row.getElementsByTagName('td')).forEach(function (cell, colIndex) {
          rowData[colIndex] = cell.textContent;
      });
      data.push(rowData);
  });
  localStorage.setItem('equipmentData', JSON.stringify(data));
}

function loadData() {
  var data = JSON.parse(localStorage.getItem('equipmentData'));
  if (data) {
      var table = document.getElementById('equipmentTable').getElementsByTagName('tbody')[0];
      data.forEach(function (rowData) {
          var newRow = table.insertRow(table.rows.length);
          Object.values(rowData).forEach(function (value) {
              var cell = newRow.insertCell();
              cell.textContent = value;
          });
          var actionCell = newRow.insertCell();
          var editButton = document.createElement("button");
          editButton.textContent = "Edit";
          editButton.className = "edit";
          editButton.addEventListener('click', function () {
              editEquipment(newRow);
          });
          actionCell.appendChild(editButton);

          var deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.className = "delete";
          deleteButton.addEventListener('click', function () {
              deleteEquipment(newRow);
          });
          actionCell.appendChild(deleteButton);
      });
  }
}
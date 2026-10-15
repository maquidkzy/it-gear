'use strict';

document.addEventListener('DOMContentLoaded', function (e) {
  const dtLayout = {
    topStart: {
      rowClass: 'row mx-2 justify-content-between',
      features: [
        {
          pageLength: {
            menu: [7, 10, 25, 50, 100],
            text: 'Show_MENU_entries'
          }
        }
      ]
    },
    topEnd: {
      search: {
        placeholder: 'Type search here'
      }
    },
    bottomStart: {
      rowClass: 'row mx-2 justify-content-between',
      features: ['info']
    },
    bottomEnd: 'paging'
  };

  const dtLanguage = {
    paginate: {
      next: '<i class="icon-base ri ri-arrow-right-s-line scaleX-n1-rtl icon-22px"></i>',
      previous: '<i class="icon-base ri ri-arrow-left-s-line scaleX-n1-rtl icon-22px"></i>',
      first: '<i class="icon-base ri ri-skip-back-mini-line scaleX-n1-rtl icon-22px"></i>',
      last: '<i class="icon-base ri ri-skip-forward-mini-line scaleX-n1-rtl icon-22px"></i>'
    }
  };

  const dt_status_table = document.getElementById('table-assets-status');
  if (dt_status_table) {
    let dummyDataStatus = [];
    const titles = ["MacBook Pro M3", "Wireless Mouse (Lot 1)", "C to HDMI converter", "Dell XPS 15", "ThinkPad T14", "Dell 27 Monitor", "LG 34 Ultrawide", "HDMI Cable 2m", "USB-C Cable 1m", "Logitech MX Keys"];
    for(let i=1; i<=20; i++) {
      dummyDataStatus.push({
        id: `AST-${String(i).padStart(3, '0')}`,
        title: titles[i%10],
        status: i%3===0 ? "Remaining: 38/50" : (i%2===0 ? "On loan" : "Available")
      });
    }
    
    new DataTable(dt_status_table, {
      data: dummyDataStatus,
      columns: [
        { data: 'id' },
        { data: 'title' },
        { data: 'status' }
      ],
      columnDefs: [
        {
          targets: 2,
          render: function (data) {
            if (data.includes('Remaining')) return '<span class="text-info fw-medium">' + data + '</span>';
            if (data === 'On loan') return '<span class="text-warning fw-medium">On loan</span>';
            return '<span class="text-success fw-medium">Available</span>';
          }
        }
      ],
      order: [[0, 'asc']],
      layout: dtLayout,
      displayLength: 7,
      language: dtLanguage,
      scrollY: '300px',
      scrollX: true,
      initComplete: function (settings, json) {
        const firstRow = dt_status_table.querySelector('tbody tr:first-child');
        if (firstRow) {
          firstRow.classList.add('border-top-0');
        }
      }
    });
  }

  const dt_history_table = document.getElementById('table-borrow-history');
  if (dt_history_table) {
    let dummyDataHistory = [];
    const borrowers = ["John Doe", "Alice Smith", "Bob Johnson", "Charlie Brown", "David Lee"];
    const titles = ["MacBook Pro M3", "Wireless Mouse (Lot 1)", "C to HDMI converter", "Dell XPS 15", "ThinkPad T14", "Dell 27 Monitor", "LG 34 Ultrawide", "HDMI Cable 2m", "USB-C Cable 1m", "Logitech MX Keys"];
    for(let i=1; i<=20; i++) {
      dummyDataHistory.push({
        id: `AST-${String(i).padStart(3, '0')}`,
        title: titles[i%10],
        borrower: borrowers[i%5],
        b_date: `2026-09-${String(i).padStart(2, '0')}`,
        r_date: i%2===0 ? `2026-09-${String(i+1).padStart(2, '0')}` : "-",
        staff: "Admin Jane"
      });
    }
    
    new DataTable(dt_history_table, {
      data: dummyDataHistory,
      columns: [
        { data: 'id' },
        { data: 'title' },
        { data: 'borrower' },
        { data: 'b_date' },
        { data: 'r_date' },
        { data: 'staff' }
      ],
      order: [[3, 'desc']],
      layout: dtLayout,
      displayLength: 7,
      language: dtLanguage,
      scrollY: '300px',
      scrollX: true,
      initComplete: function (settings, json) {
        const firstRow = dt_history_table.querySelector('tbody tr:first-child');
        if (firstRow) {
          firstRow.classList.add('border-top-0');
        }
      }
    });
  }
});

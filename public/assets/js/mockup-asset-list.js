'use strict';
let fv, offCanvasEl;
document.addEventListener('DOMContentLoaded', function (e) {
  (function () {
    const formAddNewRecord = document.getElementById('form-add-new-record');
    setTimeout(() => {
      const newRecord = document.querySelector('.create-new'),
        offCanvasElement = document.querySelector('#add-new-record');
      if (newRecord) {
        newRecord.addEventListener('click', function () {
          offCanvasEl = new bootstrap.Offcanvas(offCanvasElement);
          offCanvasEl.show();
        });
      }
      
      // Force remove btn-secondary if datatables added it
      const btn = document.querySelector('.create-new');
      if (btn) {
        btn.classList.remove('btn-secondary');
      }
    }, 200);

    let dt_basic_table = document.querySelector('.datatables-basic');
    if (dt_basic_table) {
      let tableTitle = document.createElement('h5');
      tableTitle.classList.add('card-title', 'mb-0', 'text-md-start', 'text-center');
      tableTitle.innerHTML = 'Asset List';

      let dummyData = [];
      const titles = ["MacBook Pro M3", "Wireless Mouse (Lot 1)", "C to HDMI converter", "Dell XPS 15", "ThinkPad T14", "Dell 27 Monitor", "LG 34 Ultrawide", "HDMI Cable 2m", "USB-C Cable 1m", "Logitech MX Keys"];
      const categories = ["Laptops", "Accessories", "Cables", "Laptops", "Laptops", "Displays", "Displays", "Cables", "Cables", "Accessories"];
      for(let i=1; i<=20; i++) {
        dummyData.push({
          id: `AST-${String(i).padStart(3, '0')}`,
          title: titles[i%10],
          category: categories[i%10],
          stock: i%2===0 ? "1 (Yes)" : "50 (No)",
          campus: i%3===0 ? "RAMA 9" : (i%3===1 ? "ASOK" : "HUA HIN"),
          status: i%4===0 ? "Broken" : (i%5===0 ? "Lost" : "Active")
        });
      }

      let dt_basic = new DataTable(dt_basic_table, {
        data: dummyData,
        columns: [
          { data: 'id' },
          { data: 'id' },
          { data: 'title' },
          { data: 'category' },
          { data: 'stock' },
          { data: 'campus' },
          { data: 'status' }
        ],
        columnDefs: [
          {
            className: 'control',
            orderable: false,
            searchable: false,
            responsivePriority: 2,
            targets: 0,
            render: function () { return ''; }
          },
          {
            targets: 6,
            render: function (data) {
              if (data === 'Active') return '<span class="badge bg-label-success">Active</span>';
              if (data === 'Broken') return '<span class="badge bg-label-danger">Broken</span>';
              return '<span class="badge bg-label-warning">Lost</span>';
            }
          }
        ],
        order: [[1, 'desc']],
        displayLength: 7,
        lengthMenu: [7, 10, 25, 50, 75, 100],
        layout: {
          top2Start: {
            rowClass: 'row card-header mx-0 px-2',
            features: [tableTitle]
          },
          top2End: {
            features: [
              {
                buttons: [
                  {
                    text: '<span class="d-flex align-items-center"><i class="icon-base ri ri-add-line icon-18px me-sm-1"></i><span class="d-none d-sm-inline-block">Add Asset</span></span>',
                    className: 'create-new btn btn-primary waves-effect waves-light'
                  }
                ]
              }
            ]
          },
          topStart: {
            rowClass: 'row m-3 mx-2 my-0 justify-content-between',
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
            rowClass: 'row mx-3 justify-content-between',
            features: ['info']
          },
          bottomEnd: 'paging'
        },
        language: {
          paginate: {
            next: '<i class="icon-base ri ri-arrow-right-s-line scaleX-n1-rtl icon-22px"></i>',
            previous: '<i class="icon-base ri ri-arrow-left-s-line scaleX-n1-rtl icon-22px"></i>',
            first: '<i class="icon-base ri ri-skip-back-mini-line scaleX-n1-rtl icon-22px"></i>',
            last: '<i class="icon-base ri ri-skip-forward-mini-line scaleX-n1-rtl icon-22px"></i>'
          }
        },
        responsive: {
          details: {
            display: DataTable.Responsive.display.modal({
              header: function (row) {
                const data = row.data();
                return 'Details of ' + data['title'];
              }
            }),
            type: 'column',
            renderer: function (api, rowIdx, columns) {
              const data = $.map(columns, function (col, i) {
                return col.title !== ''
                  ? '<tr data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' + '<td>' + col.title + ':' + '</td> ' + '<td>' + col.data + '</td>' + '</tr>'
                  : '';
              }).join('');
              return data ? $('<table class="table"/><tbody />').append(data) : false;
            }
          }
        }
      });
    }
  })();
});
// Extra fix for gray button issue
setInterval(() => {
  const btn = document.querySelector('.create-new');
  if (btn && btn.classList.contains('btn-secondary')) {
    btn.classList.remove('btn-secondary');
  }
}, 100);

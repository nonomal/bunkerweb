$(document).ready(function () {
  var toastNum = 0;
  var actionLock = false;
  var showLoadingModal = false;
  const instanceNumber = parseInt($("#instances_number").val());
  const isReadOnly = $("#is-read-only").val().trim() === "True";

  const pingInstances = (instances) => {
    showLoadingModal = true;

    setTimeout(() => {
      if (actionLock && showLoadingModal) {
        $(".dt-button-background").click();
        $("#loadingModal").modal("show");
        setTimeout(() => {
          $("#loadingModal").modal("hide");
        }, 5000);
      }
    }, 500);

    // Create a FormData object
    const formData = new FormData();
    formData.append("csrf_token", $("#csrf_token").val()); // Add the CSRF token // TODO: find a way to ignore CSRF token
    formData.append("instances", instances.join(",")); // Add the instances

    // Send the form data using $.ajax
    $.ajax({
      url: `${window.location.pathname}/ping`,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        data.failed.forEach((instance) => {
          var feedbackToastFailed = $("#feedback-toast").clone(); // Clone the feedback toast
          feedbackToastFailed.attr("id", `feedback-toast-${toastNum++}`); // Corrected to set the ID for the failed toast
          feedbackToastFailed.addClass("border-danger");
          feedbackToastFailed.find(".toast-header").addClass("text-danger");
          feedbackToastFailed.find("span").text("Ping failed");
          feedbackToastFailed.find("div.toast-body").text(instance.message);
          feedbackToastFailed.appendTo("#feedback-toast-container"); // Ensure the toast is appended to the container
          feedbackToastFailed.toast("show");
        });

        if (data.succeed.length > 0) {
          var feedbackToastSucceed = $("#feedback-toast").clone(); // Clone the feedback toast
          feedbackToastSucceed.attr("id", `feedback-toast-${toastNum++}`);
          feedbackToastSucceed.addClass("border-primary");
          feedbackToastSucceed.find(".toast-header").addClass("text-primary");
          feedbackToastSucceed.find("span").text("Ping successful");
          feedbackToastSucceed
            .find("div.toast-body")
            .text(`Instances: ${data.succeed.join(", ")}`);
          feedbackToastSucceed.appendTo("#feedback-toast-container");
          feedbackToastSucceed.toast("show");
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX request failed:", status, error);
        alert("An error occurred while pinging the instances.");
      },
      complete: function () {
        actionLock = false;
        showLoadingModal = false;
        $("#loadingModal").modal("hide");
      },
    });
  };

  const setupDeletionModal = (instances) => {
    $("#selected-instances-input").val(instances.join(","));

    const list = $(
      `<ul class="list-group list-group-horizontal w-100">
        <li class="list-group-item bg-secondary text-white" style="flex: 1 0;">
          <div class="ms-2 me-auto">
            <div class="fw-bold">Hostname</div>
          </div>
        </li>
        <li class="list-group-item bg-secondary text-white" style="flex: 1 0;">
          <div class="fw-bold">Health</div>
        </li>
        </ul>`,
    );
    $("#selected-instances").append(list);

    const delete_modal = $("#modal-delete-instances");
    instances.forEach((instance) => {
      const list = $(
        `<ul class="list-group list-group-horizontal w-100"></ul>`,
      );

      // Create the list item using template literals
      const listItem = $(`<li class="list-group-item" style="flex: 1 0;">
  <div class="ms-2 me-auto">
    <div class="fw-bold">${instance}</div>
  </div>
</li>`);
      list.append(listItem);

      // Clone the status element and append it to the list item
      const statusClone = $("#status-" + instance).clone();
      const statusListItem = $(
        `<li class="list-group-item" style="flex: 1 0;"></li>`,
      );
      statusListItem.append(statusClone.removeClass("highlight"));
      list.append(statusListItem);

      // Append the list item to the list
      $("#selected-instances").append(list);
    });

    const modal = new bootstrap.Modal(delete_modal);
    modal.show();
  };

  const execForm = (instances, action) => {
    // Create a form element using jQuery and set its attributes
    const form = $("<form>", {
      method: "POST",
      action: `${window.location.pathname}/${action}`,
      class: "visually-hidden",
    });

    // Add CSRF token and instances as hidden inputs
    form.append(
      $("<input>", {
        type: "hidden",
        name: "csrf_token",
        value: $("#csrf_token").val(),
      }),
    );
    form.append(
      $("<input>", {
        type: "hidden",
        name: "instances",
        value: instances.join(","),
      }),
    );

    // Append the form to the body and submit it
    form.appendTo("body").submit();
  };

  const layout = {
    top1: {
      searchPanes: {
        viewTotal: true,
        cascadePanes: true,
        collapse: false,
        columns: [4, 5, 6, 7, 8],
      },
    },
    topStart: {},
    topEnd: {
      buttons: [
        {
          extend: "toggle_filters",
          className: "btn btn-sm btn-outline-primary toggle-filters",
        },
      ],
      search: true,
    },
    bottomStart: {
      info: true,
    },
    bottomEnd: {},
  };

  if (instanceNumber > 10) {
    const menu = [10];
    if (instanceNumber > 25) {
      menu.push(25);
    }
    if (instanceNumber > 50) {
      menu.push(50);
    }
    if (instanceNumber > 100) {
      menu.push(100);
    }
    menu.push({ label: "All", value: -1 });
    layout.bottomStart = {
      pageLength: {
        menu: menu,
      },
      info: true,
    };
    layout.bottomEnd.paging = true;
  }

  layout.topStart.buttons = [
    {
      extend: "create_instance",
    },
    {
      extend: "colvis",
      columns: "th:not(:nth-child(-n+3)):not(:last-child)",
      text: '<span class="tf-icons bx bx-columns bx-18px me-md-2"></span><span class="d-none d-md-inline">Columns</span>',
      className: "btn btn-sm btn-outline-primary rounded-start",
      columnText: function (dt, idx, title) {
        return idx + 1 + ". " + title;
      },
    },
    {
      extend: "colvisRestore",
      text: '<span class="tf-icons bx bx-reset bx-18px me-2"></span>Reset columns',
      className: "btn btn-sm btn-outline-primary d-none d-md-inline",
    },
    {
      extend: "collection",
      text: '<span class="tf-icons bx bx-export bx-18px me-md-2"></span><span class="d-none d-md-inline">Export</span>',
      className: "btn btn-sm btn-outline-primary",
      buttons: [
        {
          extend: "copy",
          text: '<span class="tf-icons bx bx-copy bx-18px me-2"></span>Copy visible',
          exportOptions: {
            columns: ":visible:not(:nth-child(-n+2)):not(:last-child)",
          },
        },
        {
          extend: "csv",
          text: '<span class="tf-icons bx bx-table bx-18px me-2"></span>CSV',
          bom: true,
          filename: "bw_instances",
          exportOptions: {
            modifier: {
              search: "none",
            },
            columns: ":not(:nth-child(-n+2)):not(:last-child)",
          },
        },
        {
          extend: "excel",
          text: '<span class="tf-icons bx bx-table bx-18px me-2"></span>Excel',
          filename: "bw_instances",
          exportOptions: {
            modifier: {
              search: "none",
            },
            columns: ":not(:nth-child(-n+2)):not(:last-child)",
          },
        },
      ],
    },
    {
      extend: "collection",
      text: '<span class="tf-icons bx bx-play bx-18px me-md-2"></span><span class="d-none d-md-inline">Actions</span>',
      className: "btn btn-sm btn-outline-primary action-button disabled",
      buttons: [
        {
          extend: "ping_instances",
        },
        {
          extend: "exec_form",
          text: '<span class="tf-icons bx bx-refresh bx-18px me-2"></span>Reload',
        },
        {
          extend: "exec_form",
          text: '<span class="tf-icons bx bx-stop bx-18px me-2"></span>Stop',
        },
        {
          extend: "delete_instances",
          className: "text-danger",
        },
      ],
    },
  ];

  $("#modal-delete-instances").on("hidden.bs.modal", function () {
    $("#selected-instances").empty();
    $("#selected-instances-input").val("");
  });

  const getSelectedInstances = () => {
    const instances = [];
    $("tr.selected").each(function () {
      instances.push($(this).find("td:eq(2)").text());
    });
    return instances;
  };

  $.fn.dataTable.ext.buttons.create_instance = {
    text: '<span class="tf-icons bx bx-plus"></span><span class="d-none d-md-inline">&nbsp;Create new instance</span>',
    className: `btn btn-sm rounded me-4 btn-bw-green${
      isReadOnly ? " disabled" : ""
    }`,
    action: function (e, dt, node, config) {
      if (isReadOnly) {
        alert("This action is not allowed in read-only mode.");
        return;
      }
      const modal = new bootstrap.Modal($("#modal-create-instance"));
      modal.show();

      $("#modal-create-instance").on("shown.bs.modal", function () {
        $(this).find("#hostname").focus();
      });
    },
  };

  $.fn.dataTable.ext.buttons.ping_instances = {
    text: '<span class="tf-icons bx bx-bell bx-18px me-2"></span>Ping',
    action: function (e, dt, node, config) {
      if (actionLock) {
        return;
      }
      actionLock = true;

      const instances = getSelectedInstances();
      if (instances.length === 0) {
        actionLock = false;
        return;
      }

      pingInstances(instances);
    },
  };

  $.fn.dataTable.ext.buttons.exec_form = {
    action: function (e, dt, node, config) {
      if (actionLock) {
        return;
      }
      actionLock = true;

      const instances = getSelectedInstances();
      if (instances.length === 0) {
        actionLock = false;
        return;
      }

      const bxIcon = node.find("span.bx").attr("class").split(" ")[2];
      if (bxIcon === "bx-refresh") {
        var action = "reload";
      } else if (bxIcon === "bx-stop") {
        var action = "stop";
      } else {
        actionLock = false;
        return;
      }

      execForm(instances, action);
    },
  };

  $.fn.dataTable.ext.buttons.delete_instances = {
    text: '<span class="tf-icons bx bx-trash bx-18px me-2"></span>Delete',
    action: function (e, dt, node, config) {
      if (isReadOnly) {
        alert("This action is not allowed in read-only mode.");
        return;
      }
      if (actionLock) {
        return;
      }
      actionLock = true;
      $(".dt-button-background").click();

      const instances = getSelectedInstances();
      if (instances.length === 0) {
        actionLock = false;
        return;
      }

      setupDeletionModal(instances);

      actionLock = false;
    },
  };

  initializeDataTable({
    tableSelector: "#instances",
    tableName: "instances",
    columnVisibilityCondition: (column) => column > 2 && column < 9,
    dataTableOptions: {
      columnDefs: [
        {
          orderable: false,
          className: "dtr-control",
          targets: 0,
        },
        {
          orderable: false,
          render: DataTable.render.select(),
          targets: 1,
        },
        {
          orderable: false,
          targets: -1,
        },
        {
          visible: false,
          targets: [3, 4],
        },
        {
          targets: [7, 8],
          render: function (data, type, row) {
            if (type === "display" || type === "filter") {
              const date = new Date(data);
              if (!isNaN(date.getTime())) {
                return date.toLocaleString();
              }
            }
            return data;
          },
        },
        {
          searchPanes: {
            show: true,
            combiner: "or",
            orderable: false,
          },
          targets: [4],
        },
        {
          searchPanes: {
            show: true,
            options: [
              {
                label:
                  '<i class="bx bx-xs bx-up-arrow-alt text-success"></i>&nbsp;Up',
                value: function (rowData, rowIdx) {
                  return rowData[5].includes("Up");
                },
              },
              {
                label:
                  '<i class="bx bx-xs bx-down-arrow-alt text-danger"></i>&nbsp;Down',
                value: function (rowData, rowIdx) {
                  return rowData[5].includes("Down");
                },
              },
              {
                label:
                  '<i class="bx bx-xs bxs-hourglass text-warning"></i>&nbsp;Loading',
                value: function (rowData, rowIdx) {
                  return rowData[5].includes("Loading");
                },
              },
            ],
            combiner: "or",
            orderable: false,
          },
          targets: 5,
        },
        {
          searchPanes: {
            show: true,
            options: [
              {
                label: '<i class="bx bx-xs bx-microchip"></i>&nbsp;Static',
                value: function (rowData, rowIdx) {
                  return rowData[6].includes("Static");
                },
              },
              {
                label: '<i class="bx bx-xs bxl-docker"></i>&nbsp;Container',
                value: function (rowData, rowIdx) {
                  return rowData[6].includes("Container");
                },
              },
              {
                label: '<i class="bx bx-xs bxl-kubernetes"></i>&nbsp;Pod',
                value: function (rowData, rowIdx) {
                  return rowData[6].includes("Pod");
                },
              },
            ],
            combiner: "or",
            orderable: false,
          },
          targets: 6,
        },
        {
          searchPanes: {
            show: true,
            options: [
              {
                label: "Last 24 hours",
                value: function (rowData, rowIdx) {
                  const date = new Date(rowData[7]);
                  const now = new Date();
                  return now - date < 24 * 60 * 60 * 1000;
                },
              },
              {
                label: "Last 7 days",
                value: function (rowData, rowIdx) {
                  const date = new Date(rowData[7]);
                  const now = new Date();
                  return now - date < 7 * 24 * 60 * 60 * 1000;
                },
              },
              {
                label: "Last 30 days",
                value: function (rowData, rowIdx) {
                  const date = new Date(rowData[7]);
                  const now = new Date();
                  return now - date < 30 * 24 * 60 * 60 * 1000;
                },
              },
            ],
            combiner: "or",
            orderable: false,
          },
          targets: 7,
        },
        {
          searchPanes: {
            show: true,
            options: [
              {
                label: "Last 24 hours",
                value: function (rowData, rowIdx) {
                  const date = new Date(rowData[8]);
                  const now = new Date();
                  return now - date < 24 * 60 * 60 * 1000;
                },
              },
              {
                label: "Last 7 days",
                value: function (rowData, rowIdx) {
                  const date = new Date(rowData[8]);
                  const now = new Date();
                  return now - date < 7 * 24 * 60 * 60 * 1000;
                },
              },
              {
                label: "Last 30 days",
                value: function (rowData, rowIdx) {
                  const date = new Date(rowData[8]);
                  const now = new Date();
                  return now - date < 30 * 24 * 60 * 60 * 1000;
                },
              },
            ],
            combiner: "or",
            orderable: false,
          },
          targets: 8,
        },
      ],
      order: [[8, "desc"]],
      autoFill: false,
      responsive: true,
      select: {
        style: "multi+shift",
        selector: "td:nth-child(2)",
        headerCheckbox: true,
      },
      layout: layout,
      language: {
        info: "Showing _START_ to _END_ of _TOTAL_ instances",
        infoEmpty: "No instances available",
        infoFiltered: "(filtered from _MAX_ total instances)",
        lengthMenu: "Display _MENU_ instances",
        zeroRecords: "No matching instances found",
        select: {
          rows: {
            _: "Selected %d instances",
            0: "No instances selected",
            1: "Selected 1 instance",
          },
        },
      },
      initComplete: function (settings, json) {
        $("#instances_wrapper .btn-secondary").removeClass("btn-secondary");
        if (isReadOnly)
          $("#instances_wrapper .dt-buttons")
            .attr(
              "data-bs-original-title",
              "The database is in readonly, therefore you cannot create new instances.",
            )
            .attr("data-bs-placement", "right")
            .tooltip();
      },
    },
  });

  $(document).on("click", ".ping-instance", function () {
    if (actionLock) {
      return;
    }
    actionLock = true;

    const instance = $(this).data("instance");
    pingInstances([instance]);
  });

  $(document).on("click", ".reload-instance, .stop-instance", function () {
    const instance = $(this).data("instance");
    const action = $(this).hasClass("reload-instance") ? "reload" : "stop";
    execForm([instance], action);
  });

  $(document).on("click", ".delete-instance", function () {
    if (isReadOnly) {
      alert("This action is not allowed in read-only mode.");
      return;
    }
    const instance = $(this).data("instance");
    setupDeletionModal([instance]);
  });
});

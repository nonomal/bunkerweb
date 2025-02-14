$(document).ready(function () {
  const isReadOnly = $("#is-read-only").val().trim() === "True";
  let selectedService = $("#selected-service").val().trim();
  const originalService = selectedService;
  let selectedType = $("#selected-type").val().trim();
  const originalType = selectedType;
  const originalName = $("#config-name").val().trim();
  const editorElement = $("#config-value");
  const initialContent = editorElement.text().trim();
  const editor = ace.edit(editorElement[0]);

  var theme = $("#theme").val();

  function setEditorTheme() {
    if (theme === "dark") {
      editor.setTheme("ace/theme/cloud9_night");
    } else {
      editor.setTheme("ace/theme/cloud9_day");
    }
  }

  setEditorTheme();

  $("#dark-mode-toggle").on("change", function () {
    setTimeout(() => {
      theme = $("#theme").val();
      setEditorTheme();
    }, 30);
  });

  if (isReadOnly && window.location.pathname.endsWith("/new"))
    window.location.href = window.location.href.split("/new")[0];

  const language = editorElement.data("language"); // TODO: Support ModSecurity
  if (language === "NGINX") {
    editor.session.setMode("ace/mode/nginx");
  } else {
    editor.session.setMode("ace/mode/text"); // Default mode if language is unrecognized
  }

  const method = editorElement.data("method");
  const template = editorElement.data("template");
  if (method !== "ui" && template === "") {
    editor.setReadOnly(true);
  }

  // Set the editor's initial content
  editor.setValue(initialContent, -1); // The second parameter moves the cursor to the start

  editor.setOptions({
    fontSize: "14px",
    showPrintMargin: false,
    tabSize: 2,
    useSoftTabs: true,
    wrap: true,
  });

  editor.renderer.setScrollMargin(10, 10);

  editorElement.removeClass("visually-hidden");
  $("#config-waiting").addClass("visually-hidden");

  const $serviceSearch = $("#service-search");
  const $serviceDropdownMenu = $("#services-dropdown-menu");
  const $serviceDropdownItems = $("#services-dropdown-menu li.nav-item");
  const $typeDropdownItems = $("#types-dropdown-menu li.nav-item");

  const changeTypesVisibility = () => {
    $typeDropdownItems.each(function () {
      const item = $(this);
      item.toggle(
        selectedService === "global" || item.data("context") === "multisite",
      );
    });
  };

  $("#select-service").on("click", () => $serviceSearch.focus());

  $serviceSearch.on(
    "input",
    debounce((e) => {
      const inputValue = e.target.value.toLowerCase();
      let visibleItems = 0;

      $serviceDropdownItems.each(function () {
        const item = $(this);
        const matches = item.text().toLowerCase().includes(inputValue);

        item.toggle(matches);

        if (matches) {
          visibleItems++; // Increment when an item is shown
        }
      });

      if (visibleItems === 0) {
        if ($serviceDropdownMenu.find(".no-service-items").length === 0) {
          $serviceDropdownMenu.append(
            '<li class="no-service-items dropdown-item text-muted">No Item</li>',
          );
        }
      } else {
        $serviceDropdownMenu.find(".no-service-items").remove();
      }
    }, 50),
  );

  $(document).on("hidden.bs.dropdown", "#select-service", function () {
    $("#service-search").val("").trigger("input");
  });

  $serviceDropdownItems.on("click", function () {
    selectedService = $(this).text().trim();
    changeTypesVisibility();
    if (
      selectedService !== "global" &&
      $(`#config-type-${selectedType}`).data("context") !== "multisite"
    ) {
      const firstMultisiteType = $(
        `#types-dropdown-menu li.nav-item[data-context="multisite"]`,
      ).first();
      $("#select-type")
        .parent()
        .attr("data-bs-custom-class", "warning-tooltip")
        .attr(
          "data-bs-original-title",
          `Switched to ${firstMultisiteType
            .text()
            .trim()} as ${selectedType} is not a valid multisite type.`,
        )
        .tooltip("show");

      // Hide tooltip after 2 seconds
      setTimeout(() => {
        $("#select-type")
          .parent()
          .tooltip("hide")
          .attr("data-bs-original-title", "");
      }, 2000);

      firstMultisiteType.find("button").tab("show");
      selectedType = firstMultisiteType.text().trim();
    }
  });

  $typeDropdownItems.on("click", function () {
    editor.session.setMode("ace/mode/nginx");
    selectedType = $(this).text().trim();
    // if (selectedType.startsWith("CRS") || selectedType.startsWith("MODSEC")) {
    //   editor.session.setMode("ace/mode/text"); // TODO: Support ModSecurity
    // } else {
    //   editor.session.setMode("ace/mode/nginx");
    // }
  });

  $(".save-config").on("click", function () {
    if (isReadOnly) {
      alert("This action is not allowed in read-only mode.");
      return;
    }
    const value = editor.getValue().trim();
    if (
      value &&
      value === initialContent &&
      selectedService === originalService &&
      selectedType === originalType &&
      $("#config-name").val().trim() === originalName
    ) {
      alert("No changes detected.");
      return;
    }

    const $configInput = $("#config-name");
    const configName = $configInput.val().trim();
    const pattern = $configInput.attr("pattern");
    let errorMessage = "";
    let isValid = true;

    if (!configName) {
      errorMessage = "A custom configuration name is required.";
      isValid = false;
    } else if (pattern && !new RegExp(pattern).test(configName))
      isValid = false;

    if (!isValid) {
      $configInput
        .attr(
          "data-bs-original-title",
          errorMessage || "Please enter a valid configuration name.",
        )
        .tooltip("show");

      // Hide tooltip after 2 seconds
      setTimeout(() => {
        $configInput.tooltip("hide").attr("data-bs-original-title", "");
      }, 2000);
      return;
    }

    const form = $("<form>", {
      method: "POST",
      action: window.location.href,
      class: "visually-hidden",
    });

    form.append(
      $("<input>", {
        type: "hidden",
        name: "service",
        value: $("<div>").text(selectedService).html(),
      }),
    );
    form.append(
      $("<input>", {
        type: "hidden",
        name: "type",
        value: $("<div>").text(selectedType).html(),
      }),
    );
    form.append(
      $("<input>", {
        type: "hidden",
        name: "name",
        value: $("<div>").text(configName).html(),
      }),
    );
    form.append(
      $("<input>", {
        type: "hidden",
        name: "value",
        value: $("<div>").text(value).html(),
      }),
    );
    form.append(
      $("<input>", {
        type: "hidden",
        name: "csrf_token",
        value: $("<div>").text($("#csrf_token").val()).html(), // Sanitize the value
      }),
    );

    $(window).off("beforeunload");
    form.appendTo("body").submit();
  });

  changeTypesVisibility();

  $(window).on("beforeunload", function (e) {
    if (isReadOnly) return;

    const value = editor.getValue().trim();
    if (
      value &&
      value === initialContent &&
      selectedService === originalService &&
      selectedType === originalType &&
      $("#config-name").val().trim() === originalName
    )
      return;

    // Cross-browser compatibility (for older browsers)
    var message =
      "Are you sure you want to leave? Changes you made may not be saved.";
    e.returnValue = message; // Standard for most browsers
    return message; // Required for some browsers
  });
});

import Kanban from "./Kanban";

document.addEventListener("DOMContentLoaded", () => {
  const kanbanEl = document.querySelector(".kanban");

  const kanban = new Kanban(kanbanEl);

  kanbanEl.addEventListener("click", (e) => {
    const columnEl = e.target.closest(".column");
    if (!columnEl) return;

    const column = kanban.getColumnById(columnEl.id);
    const addCardBtn = columnEl.querySelector(".add-card-btn");

    if (e.target.closest(".add-card-btn")) {
      addCardBtn.classList.add("hidden");
      column.form.show();
      return;
    }

    if (e.target.closest(".add-confirm-btn")) {
      column.addCard();
    }

    if (e.target.closest(".add-close")) {
      column.form.closeForm();
      addCardBtn.classList.remove("hidden");
      return;
    }

    if (e.target.closest(".card-close")) {
      const targetCard = column.getCardById(e.target.closest(".card").id);
      targetCard.deleteCard();
    }
  });

  kanbanEl.addEventListener("input", (e) => {
    const addCardInput = e.target.closest(".add-input");
    if (!addCardInput) return;

    addCardInput.style.height = "auto";
    addCardInput.style.height = addCardInput.scrollHeight + "px";

    if (addCardInput.value.trim()) {
      addCardInput.classList.remove("bad-status");
    }
  });

  kanbanEl.addEventListener("keydown", (e) => {
    const columnEl = e.target.closest(".column");
    if (!columnEl) return;

    const column = kanban.getColumnById(columnEl.id);
    const textarea = column.form.textarea;

    if (!textarea) return;

    if (e.key === "Enter" && e.shiftKey) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      textarea.value =
        textarea.value.substring(0, start) +
        "\n" +
        textarea.value.substring(end);

      textarea.selectionStart = textarea.selectionEnd = start + 1;
      e.preventDefault();
    } else if (e.key === "Enter") {
      e.preventDefault();
      column.addCard();
    }
  });

  kanbanEl.addEventListener("mousedown", (e) => {
    if (e.target.closest(".column-footer")) return;
    if (e.target.closest(".card-close")) return;
    if (!e.target.closest(".card")) return;

    document.documentElement.classList.add("dragging");

    kanban.mouseDown(e);

    kanban.mouseMove(e);

    e.preventDefault();
    document.documentElement.addEventListener("mouseup", kanban.mouseUp);
    document.documentElement.addEventListener("mousemove", kanban.mouseMove);
  });
});

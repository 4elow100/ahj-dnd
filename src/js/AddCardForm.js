import createElement from "../utils/CreateElement";

export default class AddCardForm {
  constructor(column) {
    this.column = column;
    this.hidden = true;
  }

  createForm() {
    const form = createElement("form", "add-form hidden");

    const formTextarea = createElement("textarea", "add-input");
    formTextarea.placeholder = "Enter a title for this card...";
    formTextarea.setAttribute("aria-label", "Card title");
    this.textarea = formTextarea;

    const formActions = createElement("div", "add-actions");
    const formConfirm = createElement(
      "button",
      "add-confirm-btn btn",
      "Add Card",
    );
    formConfirm.type = "button";

    const formClose = createElement("button", "add-close i-btn btn");
    formClose.type = "button";
    const formCloseImage = createElement("i", "fa-solid fa-x");
    formClose.appendChild(formCloseImage);

    const formProp = createElement("button", "add-prop-btn i-btn btn");
    formProp.type = "button";
    const formPropImage = createElement("i", "fa-solid fa-ellipsis");
    formProp.appendChild(formPropImage);

    formActions.appendChild(formConfirm);
    formActions.appendChild(formClose);
    formActions.appendChild(formProp);

    form.appendChild(formTextarea);
    form.appendChild(formActions);

    this.el = form;

    return form;
  }

  show() {
    this.el.classList.remove("hidden");
    this.hidden = false;
    this.textarea.focus();
  }

  hide() {
    this.el.classList.add("hidden");
    this.hidden = true;
  }

  clearForm() {
    this.textarea.value = "";
  }

  closeForm() {
    this.hide();
    this.clearForm();
  }
}

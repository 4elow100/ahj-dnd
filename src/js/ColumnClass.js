import createElement from "../utils/CreateElement";
import Card from "./CardClass";
import AddCardForm from "./AddCardForm";

export default class Column {
  constructor(title, kanban) {
    this.title = title;
    this.kanban = kanban;
    this.cardList = new Map();
  }

  createColumn(save = true) {
    this.id = crypto.randomUUID();

    const column = createElement("section", "column");
    column.id = this.id;

    column.appendChild(this._createHeader());
    column.appendChild(this._createBody());
    column.appendChild(this._createFooter());

    this.el = column;

    if (save) this.kanban.saveToStorage();

    return column;
  }

  _createHeader() {
    const header = createElement("header", "column-header");

    const colTitle = createElement("h2", "column-title", this.title);
    const colActions = createElement("div", "column-action");
    const colPropBtn = createElement("button", "column-btn i-btn btn");
    const colPropBtnImage = createElement("i", "fa-solid fa-ellipsis");

    colPropBtn.appendChild(colPropBtnImage);
    colActions.appendChild(colPropBtn);
    header.appendChild(colTitle);
    header.appendChild(colActions);

    this.header = header;

    return header;
  }

  _createBody() {
    const body = createElement("div", "column-body");
    this.body = body;
    return body;
  }

  _createFooter() {
    const footer = createElement("footer", "column-footer");

    const button = createElement("button", "add-card-btn btn");
    const plus = createElement("span", "plus", "+");
    const title = createElement("span", "add-card-title", "Add another card");

    button.appendChild(plus);
    button.appendChild(title);
    this.addCardBtn = button;

    this.form = new AddCardForm(this);
    const formEl = this.form.createForm();

    footer.appendChild(button);
    footer.appendChild(formEl);

    return footer;
  }

  deleteColumn(save = true) {
    if (save) this.kanban.saveToStorage();
  }

  editColumnTitle(save = true) {
    if (save) this.kanban.saveToStorage();
  }

  addCard(save = true) {
    const text = this.form.textarea.value.trim();

    if (!text) {
      this.form.textarea.classList.add("bad-status");
      return;
    }

    const card = new Card(text, this);
    const cardEl = card.createCard();
    this.body.appendChild(cardEl);
    this.cardList.set(card.id, card);
    if (save) this.kanban.saveToStorage();
    this.addCardBtn.classList.remove("hidden");
    this.form.closeForm();
  }

  getCardById(id) {
    return this.cardList.get(id);
  }
}

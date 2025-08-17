import createElement from "../utils/CreateElement";

export default class Card {
  constructor(title, column) {
    this.title = title;
    this.column = column;
  }

  createCard() {
    this.id = crypto.randomUUID();
    const newCard = createElement("div", "card");
    newCard.id = this.id;
    const newCardTitle = createElement("div", "card-title", this.title);
    const newClose = createElement("button", "card-close i-btn btn");
    const newX = createElement("i", "fa-solid fa-x");

    newClose.appendChild(newX);
    newCard.appendChild(newCardTitle);
    newCard.appendChild(newClose);

    this.el = newCard;

    return newCard;
  }

  deleteCard(save = true) {
    this.el.remove();
    this.column.cardList.delete(this.id);

    if (save) this.column.kanban.saveToStorage();
  }
}

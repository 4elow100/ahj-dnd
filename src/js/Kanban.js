import Column from "./ColumnClass";
import createElement from "../utils/CreateElement";
import Card from "./CardClass";

export default class Kanban {
  constructor(el) {
    this.el = el;
    this.columnList = new Map();
    this._initKanban();
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.saveToStorage = this.saveToStorage.bind(this);
    this.currTargetItem;
    this.currIsInsertBefore;
  }

  _initKanban() {
    let localData = null;
    try {
      const raw = localStorage.getItem("kanbanData");
      if (raw) localData = JSON.parse(raw);
    } catch (err) {
      console.warn("Не удалось прочитать localStorage:", err);
    }

    if (
      !localData ||
      !localData.columnList ||
      localData.columnList.length === 0
    ) {
      this._initColumns();
      return;
    }

    this.el.innerHTML = "";

    localData.columnList.forEach((col) => {
      this.restoreColumn(col);
    });
  }

  _initColumns() {
    const toDo = new Column("TO DO", this);
    const toDoEl = toDo.createColumn();

    const inProgress = new Column("IN PROGRESS", this);
    const inProgressEl = inProgress.createColumn();

    const done = new Column("DONE", this);
    const doneEl = done.createColumn();

    this.el.appendChild(toDoEl);
    this.el.appendChild(inProgressEl);
    this.el.appendChild(doneEl);

    [toDo, inProgress, done].forEach((elem) => {
      this.columnList.set(elem.id, elem);
    });
  }

  restoreColumn(col) {
    const column = new Column(col.title, this);
    const columnEl = column.createColumn(false);
    const columnBody = columnEl.querySelector(".column-body");
    column.id = col.id;
    columnEl.id = col.id;

    col.cards.forEach((card) => {
      const newCard = new Card(card.title, column);
      const newCardEl = newCard.createCard(false);
      newCard.id = card.id;
      newCardEl.id = card.id;
      columnBody.appendChild(newCardEl);
      column.cardList.set(newCard.id, newCard);
    });

    this.el.appendChild(columnEl);
    this.columnList.set(column.id, column);
  }

  getColumnById(id) {
    return this.columnList.get(id);
  }

  createEmptyItem(el) {
    const { height, width } = el.getBoundingClientRect();
    const columnBody = el.closest(".column-body");
    const empty = createElement("div", "empty-item");

    empty.style.width = width + "px";
    empty.style.height = height + "px";
    columnBody.insertBefore(empty, el);
    this.emptyItem = empty;
  }

  _animatedMove(el, left, top, listFunc = [], duration = 0.3) {
    el.style.transition = `left ${duration}s ease, top ${duration}s ease`;
    el.style.left = left + "px";
    el.style.top = top + "px";

    el.addEventListener(
      "transitionend",
      () => {
        el.removeAttribute("style");
        listFunc.forEach((func) => func());
      },
      { once: true },
    );
  }

  mouseDown(e) {
    this.actualCardEl = e.target.closest(".card");
    this.columnFromEl = e.target.closest(".column");
    const rect = this.actualCardEl.getBoundingClientRect();

    this.shiftX = e.clientX - rect.left;
    this.shiftY = e.clientY - rect.top;

    this.actualCardEl.style.width = rect.width + "px";
    this.actualCardEl.classList.add("dragged");
    this.createEmptyItem(this.actualCardEl);
  }

  _isInsertBefore(e, target) {
    const { top, height } = target.getBoundingClientRect();
    const y = e.clientY - top;
    return y <= height / 2;
  }

  mouseMove(e) {
    if (!this.actualCardEl) return;

    this.actualCardEl.style.top = e.clientY - this.shiftY + "px";
    this.actualCardEl.style.left = e.clientX - this.shiftX + "px";

    const targetItem = e.target.closest(".card");

    if (targetItem) {
      const isInsertBefore = this._isInsertBefore(e, targetItem);

      if (this.currTargetItem !== targetItem) {
        if (targetItem !== this.emptyItem) {
          if (this.emptyItem) {
            this.emptyItem.classList.add("hidden");
          }
        }

        this.currTargetItem = targetItem;
        if (isInsertBefore) {
          targetItem.parentNode.insertBefore(this.emptyItem, targetItem);
        } else {
          targetItem.parentNode.insertBefore(
            this.emptyItem,
            targetItem.nextSibling,
          );
        }

        this.emptyItem.classList.remove("hidden");
      } else if (this.currIsInsertBefore !== isInsertBefore) {
        this.currIsInsertBefore = isInsertBefore;
        if (isInsertBefore) {
          targetItem.parentNode.insertBefore(this.emptyItem, targetItem);
        } else {
          targetItem.parentNode.insertBefore(
            this.emptyItem,
            targetItem.nextSibling,
          );
        }
      }
    } else if (e.target.closest(".column-footer")) {
      const columnEl = e.target.closest(".column");
      const column = this.getColumnById(columnEl.id);
      const columnBody = column.body;

      columnBody.appendChild(this.emptyItem);
    } else if (!e.target.closest(".column")) {
      const columnBody = this.actualCardEl.closest(".column-body");
      columnBody.insertBefore(this.emptyItem, this.actualCardEl);
    }
  }

  mouseUp() {
    const targetColumn = this.emptyItem.closest(".column");

    if (targetColumn) {
      const targetColumnBody = targetColumn.querySelector(".column-body");
      targetColumnBody.insertBefore(this.actualCardEl, this.emptyItem);
    }

    const columnFrom = this.getColumnById(this.columnFromEl.id);
    const actualCardObj = columnFrom.getCardById(this.actualCardEl.id);
    if (targetColumn && actualCardObj) {
      if (actualCardObj.column.el !== targetColumn) {
        columnFrom.cardList.delete(actualCardObj.id);
        const columnTo = this.getColumnById(targetColumn.id);
        columnTo.cardList.set(actualCardObj.id, actualCardObj);
        actualCardObj.column = columnTo;
      }
    }

    const rect = this.emptyItem.getBoundingClientRect();
    this._animatedMove(this.actualCardEl, rect.left, rect.top, [
      () => this.actualCardEl.classList.remove("dragged"),
      () => {
        this.actualCardEl = undefined;
      },
      () => {
        if (this.emptyItem) this.emptyItem.remove();
      },
      () => this.saveToStorage(),
    ]);

    document.documentElement.removeEventListener("mouseup", this.mouseUp);
    document.documentElement.removeEventListener("mousemove", this.mouseMove);
    document.documentElement.classList.remove("dragging");
  }

  saveToStorage() {
    const kanbanData = { columnList: [] };

    Array.from(this.el.children).forEach((column) => {
      const columnData = {
        id: column.id,
        title: column.querySelector(".column-title").textContent,
        cards: [],
      };

      const columnBody = column.querySelector(".column-body");
      if (columnBody) {
        Array.from(columnBody.children).forEach((card) => {
          columnData.cards.push({
            id: card.id,
            title: card.querySelector(".card-title").textContent,
          });
        });
      }

      kanbanData.columnList.push(columnData);
    });

    localStorage.setItem("kanbanData", JSON.stringify(kanbanData));
  }
}

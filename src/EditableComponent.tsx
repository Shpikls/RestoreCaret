import {useState, useRef, useEffect} from "react";

// Интерфейс для позиции каретки
interface CaretPosition {
    start: number;
    end: number;
    node: Node;
}

function EditableComponent() {
    const [text, setText] = useState<string>("Начальный текст");
    const divRef = useRef<HTMLDivElement>(null);
    const caretPositionRef = useRef<CaretPosition>(null);

    // Сохранение позиции каретки
    const saveCaretPosition = (): CaretPosition | null => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            return {
                start: range.startOffset,
                end: range.endOffset,
                node: range.startContainer,
            };
        }
        return null;
    };

    // Восстановление позиции каретки
    const restoreCaretPosition = (prevPosition: CaretPosition | null): void => {
        if (!prevPosition || !divRef.current) return;

        const selection = window.getSelection();
        if (!selection) return;

        const range = document.createRange();
        const targetNode = prevPosition.node;

        if (divRef.current.contains(targetNode)) {
            const nodeLength = targetNode.textContent?.length || 0;
            range.setStart(targetNode, Math.min(prevPosition.start, nodeLength));
            range.setEnd(targetNode, Math.min(prevPosition.end, nodeLength));
            selection.removeAllRanges();
            range.collapse(true);
            selection.addRange(range);
        }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>): void => {
        const currentElement = e.currentTarget;
        const newText = currentElement.textContent || "";

        // Сохраняем позицию каретки перед изменением
        const caretPosition = saveCaretPosition();

        // Обновляем состояние
        setText(newText);

        // Принудительно синхронизируем DOM с состоянием
        if (divRef.current && divRef.current.textContent !== newText) {
            divRef.current.textContent = newText;
        }

        caretPositionRef.current = caretPosition;
    };

    useEffect(() => {
        // Восстанавливаем позицию каретки после обновления
        restoreCaretPosition(caretPositionRef.current);
    });

    return (
        <div
            ref={divRef}
            contentEditable
            onInput={handleInput}
            style={{ border: "1px solid black", padding: "10px" }}
        >
            {text}
        </div>
    );
}

export { EditableComponent };
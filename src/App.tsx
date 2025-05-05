import { useState, useEffect } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [inputType, setInputType] = useState<"mouse" | "touch" | "unknown">("unknown");

  useEffect(() => {
    // Phát hiện ban đầu bằng media queries và navigator.maxTouchPoints
    const isTouchDevice =
      window.matchMedia("(hover: none)").matches &&
      window.matchMedia("(pointer: coarse)").matches;
    const hasTouchPoints = navigator.maxTouchPoints > 0;

    if (isTouchDevice || hasTouchPoints) {
      setInputType("touch");
    } else {
      setInputType("mouse");
    }

    const handlePointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse") setInputType("mouse");
      else if (e.pointerType === "touch") setInputType("touch");
    };

    window.addEventListener("pointerdown", handlePointer);

    // Xóa listener khi component unmount
    return () => {
      window.removeEventListener("pointerdown", handlePointer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEditing = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id: number) => {
    if (!editText.trim()) return;
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
    setEditText("");
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // Log chiều rộng và loại đầu vào để kiểm tra
  useEffect(() => {
    console.log("Input type:", inputType);
  }, [inputType]);

  return (
    <div className="font-sans m-0 bg-gray-100 min-h-screen flex justify-center items-center">
      <div className={`w-[400px] bg-white p-2 sm:p-5 rounded-lg shadow-md sm:shadow-lg box-border min-w-0`}>
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-4">Todo List</h1>
        <form onSubmit={addTodo} className="mb-2 sm:mb-4">
          <div className="flex gap-1 sm:gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task"
              className="flex-1 p-1 sm:p-2 border rounded-lg focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className={`px-2 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-lg ${inputType === "mouse" ? "hover:bg-blue-600" : ""} text-sm sm:text-base`}
            >
              Add
            </button>
          </div>
        </form>
        <div className="flex justify-center gap-1 sm:gap-2 mb-2 sm:mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-2 sm:px-3 py-1 sm:py-1 rounded-lg ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-2 sm:px-3 py-1 sm:py-1 rounded-lg ${filter === "active" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-2 sm:px-3 py-1 sm:py-1 rounded-lg ${filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Completed
          </button>
        </div>
        <ul className="space-y-1 sm:space-y-2 max-h-[80vh] overflow-y-auto">
          {filteredTodos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-gray-50 rounded-lg max-w-full sm:max-w-xl min-w-0">
              {editingId === todo.id ? (
                <input
                  key={todo.id}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => saveEdit(todo.id)}
                  onKeyPress={(e) => e.key === "Enter" && saveEdit(todo.id)}
                  className="w-full p-1 sm:p-1 border rounded-lg overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-scrollbar]:hidden"
                  autoFocus
                />
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-4 sm:h-5 w-4 sm:w-5 flex-none"
                  />
                  <span
                    onDoubleClick={() => startEditing(todo.id, todo.text)}
                    className={`flex-1 text-xs sm:text-sm min-w-0 overflow-x-auto [scrollbar-width:none] ${todo.completed ? "line-through text-gray-500" : ""}`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className={`px-1 sm:px-2 py-0.5 sm:py-1 text-red-500 ${inputType === "mouse" ? "hover:text-red-700" : ""} flex-none text-xs sm:text-sm`}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
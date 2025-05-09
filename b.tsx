"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = "all" | "active" | "completed";

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleComplete: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, newText: string) => void;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodos must be used within a TodoProvider");
  }
  return context;
};

const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window !== "undefined") {
      const savedTodos = localStorage.getItem("todos");
      return savedTodos ? JSON.parse(savedTodos) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = (text: string) => {
    setTodos((prevTodos) => [
      { id: uuidv4(), text, completed: false, createdAt: Date.now() },
      ...prevTodos,
    ]);
  };

  const toggleComplete = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: string, newText: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  return (
    <TodoContext.Provider
      value={{ todos, addTodo, toggleComplete, deleteTodo, editTodo, setTodos }}
    >
      {children}
    </TodoContext.Provider>
  );
};

function TodoItem({ todo }: { todo: Todo }) {
  const { toggleComplete, deleteTodo, editTodo } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSaveEdit = () => {
    if (editText.trim() !== "") {
      editTodo(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <Reorder.Item
      value={todo}
      id={todo.id}
      className={`flex items-center justify-between bg-white p-4 mb-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out ${
        todo.completed ? "opacity-70" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      layout
      dragListener={!isEditing}
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }}
    >
      {isEditing ? (
        <div className="flex-grow flex items-center gap-2">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-grow p-2 border border-blue-500 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <motion.button
            onClick={handleSaveEdit}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save
          </motion.button>
          <motion.button
            onClick={handleCancelEdit}
            className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        </div>
      ) : (
        <>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleComplete(todo.id)}
            className="mr-4 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
          />
          <span
            className={`flex-grow text-lg font-medium ${
              todo.completed ? "line-through text-gray-500" : "text-gray-800"
            }`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.text}
          </span>
          <motion.button
            onClick={() => deleteTodo(todo.id)}
            className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors ml-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Delete
          </motion.button>
        </>
      )}
    </Reorder.Item>
  );
}

export default function Home() {
  const { todos, addTodo, setTodos } = useTodos();
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const handleAddTodo = () => {
    if (inputValue.trim() !== "") {
      addTodo(inputValue.trim());
      setInputValue("");
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <TodoProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-2xl">
          <motion.h1
            className="text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            🌌 Cosmic Task Manager 🌌
          </motion.h1>

          <motion.div
            className="flex gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
              placeholder="What's your next mission?"
              className="flex-grow p-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
            <motion.button
              onClick={handleAddTodo}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Add Task
            </motion.button>
          </motion.div>

          <motion.div
            className="flex justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {["all", "active", "completed"].map((f) => (
              <motion.button
                key={f}
                onClick={() => setFilter(f as FilterType)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  filter === f
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </motion.button>
            ))}
          </motion.div>

          <Reorder.Group
            axis="y"
            values={filteredTodos}
            onReorder={setTodos}
            className="space-y-3"
          >
            <AnimatePresence initial={false}>
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))
              ) : (
                <motion.p
                  className="text-center text-gray-500 italic py-10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  No tasks for this category, go create some magic! ✨
                </motion.p>
              )}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      </div>
    </TodoProvider>
  );
}

import React, {useState} from 'react';

import {Todo} from './todo.modal';

import TodoList from './components/ToDoList';
import NewTodo from './components/NewTodo';

const App: React.FunctionComponent = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const todoAddHandler = (text: string) => {
    setTodos(prevTodos => 
      [...prevTodos, {id: Math.random().toString(), text: text}]
    )
  };

  const todoDeleteHandler = (id: string) => {
    setTodos(prev => {
      return prev.filter((todo => todo.id !== id));
    })
  }

  return <div className="App">
    <NewTodo onAddTodo={todoAddHandler}></NewTodo>
    <TodoList items={todos} onDeleteTodo={todoDeleteHandler}></TodoList>
  </div>
};

export default App;

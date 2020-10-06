// Project State Management
class ProjectState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  // To avoid calling constructor
  private constructor() {

  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addListener(fn: Function) {
    this.listeners.push(fn);
  }

  addProject(title: string, description: string, numberOfPeople: number) {
    const project = {
      id: Math.random().toString(),
      title: title,
      description: description,
      people: numberOfPeople
    };
    this.projects.push(project);

    // When the project will be added execute listeners
    for(const fn of this.listeners) {
      fn(this.projects.slice());
    }
  }
}

// Creating Store
const projectState = ProjectState.getInstance();

// Validatable Interface
interface Validatable {
  value: string | number;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;

  if(validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }

  if(validatableInput.minLength != null && typeof validatableInput.value == 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }


  if(validatableInput.maxLength != null && typeof validatableInput.value == 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }

  if(validatableInput.min != null && typeof validatableInput.value == 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if(validatableInput.max != null && typeof validatableInput.value == 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

// Autobind Method Decorator
function Autobind (_: any, __: any, propertyDescriptor: PropertyDescriptor) {
  const fn = propertyDescriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    enumerable: false,
    configurable: true,
    get() {
      return fn.bind(this);
    }
  };

  return adjDescriptor;
}

// ProjectList Class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-list")
    );
    this.hostElement = <HTMLDivElement>document.getElementById("app");
    this.assignedProjects = [];

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement ;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: any) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
    for(const project of this.assignedProjects) {
      const li = document.createElement('li');
      li.textContent = project.title;

      listEl.appendChild(li);
    }
  }

  private renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforebegin', this.element);
  }
}

// Project Input Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById("project-input")
    );
    this.hostElement = <HTMLDivElement>document.getElementById("app");

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title');
    this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description');
    this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people');

    this.configure();
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }

  private gatherUserInputs(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1
    };

    if( !validate(titleValidatable) ||
        !validate(descriptionValidatable) ||
        !validate(peopleValidatable)
      ) {
      alert('Invalid input, please try again!');
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault(); // To Stop HTTP Execution, it is browsers default execution logic...
    const userInput = this.gatherUserInputs();

    // Checking either output is array or void if the validation is failed
    if(Array.isArray(userInput)) {
      const [title ,desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  private configure() {
    // Callback has its own context so we should pass this to access object properties from callback function
    this.element.addEventListener('submit', this.submitHandler);
  }
}

new ProjectInput(); // Init Class
new ProjectList('active');
new ProjectList('finished');

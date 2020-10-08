// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  // To Sepecify DragTarget is valid dragTarget, will permit the drop
  dragOverHandler(event: DragEvent): void;
  // Will handle the drop, we can update the data and ui here
  dropHandler(event: DragEvent): void;
  // To revert the visual update
  dragLeaveHandler(event: DragEvent): void;
}

// Project Type
enum ProjectStatus {
  Active, Finished
}

class Project {
  constructor(public id: string, public title: string, public description: string, public people: number, public stats: ProjectStatus) {
  }
}

// Project State Management

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(fn: Listener<T>) {
    this.listeners.push(fn);
  }
}

class ProjectState extends State<Project>{
  private projects: Project[] = [];
  private static instance: ProjectState;

  // To avoid calling constructor
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  addProject(title: string, description: string, numberOfPeople: number) {
    const project = new Project(Math.random().toString(), title, description, numberOfPeople, ProjectStatus.Active);

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

// Component Base Class, Abstract word is helpful to make sure no one can instanciate it
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
    this.templateElement = <HTMLTemplateElement>document.getElementById(templateId);
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U ;

    if(newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBegining: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBegining ? 'afterbegin' : 'beforeend', this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
  private project: Project;

  get persons() {
    if(this.project.people === 1) { 
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent) {
    // dataTransfer gives you ability to transfer datas over to other DragEvents
    // we don't need to pass object, that would probably consume more memory rather then sending primitive string
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  @Autobind
  dragEndHandler(_: DragEvent) {
    console.log('DragEnd');
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assined'; // This will trigger getter
    this.element.querySelector('p')!.textContent = this.project.title;
  }
}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super("project-list", "app", false, `${type}-projects` );

    this.assignedProjects = [];
    this.configure();
  }

  @Autobind
  dragOverHandler(event: DragEvent) {
    if(event.dataTransfer && event.dataTransfer.types[0] == 'text/plain') {
      event.preventDefault(); // Otherwise dropHandler will not be called because drop operations in JS nonusable by default.
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }

  @Autobind
  dropHandler(event: DragEvent) {
    console.log(event.dataTransfer?.getData('text/plain'));
  }

  @Autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable'); 
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
    listEl.innerHTML = ''; // Clear the inner html and rendering from the filitered store again
    for(const project of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, project);
    }
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(project => {
        const projectStatus: ProjectStatus = this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished;
        return project.stats === projectStatus;
      });

      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
    this.renderContent();
  }
 
  renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

}

// Project Input Class
class ProjectInput extends Component<HTMLDivElement, HTMLFontElement>{
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, 'user-input')

    this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title');
    this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description');
    this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people');

    this.configure();
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

  configure() {
    // Callback has its own context so we should pass this to access object properties from callback function
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() {
    
  }
}

new ProjectInput(); // Init Class
new ProjectList('active');
new ProjectList('finished');

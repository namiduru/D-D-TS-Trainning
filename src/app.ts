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

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault(); // To Stop HTTP Execution, it is browsers default execution logic...
    console.log(this.titleInputElement);
  }

  private configure() {
    // Callback has its own context so we should pass this to access object properties from callback function
    this.element.addEventListener('submit', this.submitHandler);
  }
}

new ProjectInput(); // Init Class

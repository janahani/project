
class validateForm {
    constructor(form, fields, error) {
        this.form = form;
        this.fields = fields;
        this.error = error;
    }
    initialize() {
        this.validateOnSubmit();
    }
    validateOnSubmit() {
        let self = this;
        this.form.addEventListener('submit', Event => {
            self.fields.forEach(fields => {
                const input = document.querySelector(`#${fields}`);
                self.validateFields(input);
            })

            if (this.error==="true") {
                Event.preventDefault();
                this.error="false";
            }


        })

    }

    validateFields(field) {
        if (field.value === "") {
            this.setStatus(field, field.previousElementSibling.innerText + ' cannot be blank', "error");
        }
        else if (field.type === "email") {
            const re = /\S+@\S+\.\S+/;
            if (re.test(field.value)) {
                this.setStatus(field, null, "success");
            }
            else {
                this.error = "true";
                this.setStatus(field, "Please enter valid email address", "error");
            }
        }
        else if (field.id === "username" || field.id === "uname") {
            var letters = /^[A-Za-z]+$/;
            if (!field.value.match(letters)) {
                this.error = "true";
                this.setStatus(field, "Must enter letters only", "error");
            }
            else if (field.value.length < 3) {
                this.error = "true";
                this.setStatus(field, "Username must be 3+ caharcters long", "error");
            }
            else
                this.setStatus(field, null, "success");

        }
        else if (field.id === "password") {
            if (field.value.trim() == "") {
                this.error = "true";
                this.setStatus(field, "Password confirmation required", "error");
            }

            else if (field.value.length < 6) {
                this.error = "true";
                this.setStatus(field, "Username must be 6+ caharcters long", "error");
            }
            else
                this.setStatus(field, null, "success");

        }
        else if (field.id === "password-confirmation") {
            const passwordField = this.form.querySelector('#password');
            if (field.value.trim() == "") {
                this.error = "true";
                this.setStatus(field, "Password confirmation required", "error");
            }
            else if (field.value != passwordField.value) {
                this.error = "true";
                this.setStatus(field, "Passwords don't match", "error");
            }
            else if (field.value.length < 6) {
                this.error = "true";
                this.setStatus(field, "Username must be 6+ caharcters long", "error");
            }
            else {
                this.setStatus(field, null, "success");
            }
        }
        else if (field.type === "number") {
            const x = /^[0-9]+$/;
            if (x.test(field.value)) {
                this.setStatus(field, null, "success");
            }
            else {
                this.error = "true";
                this.setStatus(field, "Please enter numbers only", "error");
            }
        }
        else {
            this.setStatus(field, null, "success");
        }
    }


    setStatus(field, message, status) {
        const errorMessage = field.parentElement.querySelector('.error-message');
        if (status === "success") {
            if (errorMessage) {
                errorMessage.innerText = "";
            }
            field.classList.remove('input-error');


        }
        if (status === "error") {
            field.parentElement.querySelector('.error-message').innerText = message;
            field.classList.add('input-error');
            this.error = "true";
        }
    }

}


if (typeof document !== 'undefined') {
    const form1 = document.querySelector('.sform');
    const fields1 = ["username", "password1"];
    const signin = new validateForm(form1, fields1, "false");
    signin.initialize();

    const form2 = document.querySelector('.form');
    const fields = ["uname", "femail", "number", "password", "password-confirmation"];
    const adminAddUser = new validateForm(form2, fields, "false");
    adminAddUser.initialize();
}










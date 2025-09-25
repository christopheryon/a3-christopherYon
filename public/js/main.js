// FRONT-END (CLIENT) JAVASCRIPT HERE

const wrap = (elements, wrapper) => {
    if (elements.length) {
        const firstElement = elements[0]
        firstElement.parentNode.insertBefore(wrapper, firstElement);
        for (const element of elements) {
            if (element !== wrapper) {
                wrapper.appendChild(element);
            }
        }
    } else {
        elements.parentNode.insertBefore(wrapper, elements)
        wrapper.appendChild(elements)
    }
}

const savePassword = async (event, website, username, password, id = -1) => {
    event.preventDefault()
    const json = {website: website, username: username, password: password, id: id},
        body = JSON.stringify(json)
    if (website.length === 0) {
        alert("You must have a website!")
        return -1;
    } else if (!(website.startsWith("http://") || website.startsWith("https://"))) {
        alert("Improper website format!")
        return -1;
    }
    if (username.length === 0) {
        alert("You must have a username!")
        return -1;
    }
    if (password.length === 0) {
        alert("You must have a password!")
        return -1;
    }
    const response = await fetch("/save", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body
    })
    await createPasswordTable()
}

const createPassword = async (event) => {
    event.preventDefault()
    const newPasswordButton = document.getElementById("newPassword")
    const table = /** @type {HTMLTableElement} */ document.getElementById("passwordTable")
    const rows = table.rows
    for (let i = 0; i < rows.length; i++) {
        const buttons = rows[i].getElementsByTagName("button")
        for (const button of buttons) {
            button.setAttribute("style", "opacity: 0;")
            button.setAttribute("disabled", "")
        }
    }
    const newPasswordRow = table.tBodies.item(0).insertRow()
    newPasswordRow.className = "editPasswordRow"
    const websiteInput = document.createElement("input")
    websiteInput.id = "websiteInput"
    websiteInput.type = "url"
    websiteInput.spellcheck = false
    websiteInput.className = "tiny-padding"
    websiteInput.id = "websiteField"
    const websiteLabel = document.createElement("label")
    websiteLabel.htmlFor = "websiteField"
    websiteLabel.innerHTML = "Website"
    const usernameInput = document.createElement("input")
    usernameInput.id = "usernameInput"
    usernameInput.type = "text"
    usernameInput.spellcheck = false
    usernameInput.className = "tiny-padding"
    usernameInput.id = "usernameField"
    const usernameLabel = document.createElement("label")
    usernameLabel.htmlFor = "usernameField"
    usernameLabel.innerHTML = "Username"
    const passwordInput = document.createElement("input")
    passwordInput.id = "passwordInput"
    passwordInput.type = "text"
    passwordInput.spellcheck = false
    passwordInput.className = "tiny-padding"
    passwordInput.id = "passwordField"
    const passwordLabel = document.createElement("label")
    passwordLabel.htmlFor = "passwordField"
    passwordLabel.innerHTML = "Password"
    const inputContainer = document.createElement("div")
    inputContainer.className = "field border"
    const usernameContainer = inputContainer.cloneNode()
    const passwordContainer = inputContainer.cloneNode()
    inputContainer.appendChild(websiteInput)
    inputContainer.appendChild(websiteLabel)
    usernameContainer.appendChild(usernameInput)
    usernameContainer.appendChild(usernameLabel)
    passwordContainer.appendChild(passwordInput)
    passwordContainer.appendChild(passwordLabel)
    newPasswordRow.insertCell().appendChild(inputContainer)
    newPasswordRow.insertCell().appendChild(usernameContainer)
    newPasswordRow.insertCell().appendChild(passwordContainer)
    for (const cell of newPasswordRow.cells) {
        cell.className = "no-padding"
    }
    const strengthCell = newPasswordRow.insertCell()
    strengthCell.append("Make it strong!")
    strengthCell.className = "strengthCell"
    const newPasswordForm = document.createElement("form")
    wrap(table, newPasswordForm)
    const saveButton = document.createElement("button")
    saveButton.innerHTML = "<i>save</i>"
    saveButton.id = "saveButton"
    saveButton.className = "edit-save-button transparent circle"
    const functionCell = newPasswordRow.insertCell()
    functionCell.appendChild(saveButton)
    newPasswordButton.setAttribute("style", "display: none")
    saveButton.onclick = async (event) => {
        if (await savePassword(event, websiteInput.value, usernameInput.value, passwordInput.value) !== -1) {
            newPasswordButton.removeAttribute("style")
        }
    };
    const cancelButton = document.createElement("button")
    cancelButton.onclick = async (event) => {
        event.preventDefault()
        await createPasswordTable()
        newPasswordButton.removeAttribute("style")
    }
    cancelButton.innerHTML = "<i>cancel</i>"
    cancelButton.className = "delete-cancel-button transparent circle"
    functionCell.appendChild(cancelButton)

}

const deletePassword = async (id) => {
    const json = {id: id},
        body = JSON.stringify(json)
    const response = await fetch("/delete", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body
    })
    await createPasswordTable()
}

const editPassword = async (event, id, rowIndex) => {
    const table = /** @type {HTMLTableElement} */ document.getElementById("passwordTable")
    const rows = table.tBodies.item(0).rows
    const currentRow = rows[rowIndex]
    currentRow.className = "editPasswordRow"
    for (let i = 0; i < rows.length; i++) {
        if (i !== rowIndex) {
            const buttons = rows[i].getElementsByTagName("button")
            for (const button of buttons) {
                button.setAttribute("style", "opacity: 0;")
                button.setAttribute("disabled", "")
            }
        }
    }
    const websiteCell = currentRow.children[0].firstChild
    const usernameCell = currentRow.children[1].firstChild
    const passwordCell = currentRow.children[2].firstChild
    const editButton = currentRow.children[4].getElementsByClassName("edit-save-button")[0]
    const deleteButton = currentRow.children[4].getElementsByClassName("delete-cancel-button")[0]
    const newPasswordButton = document.getElementById("newPassword")
    newPasswordButton.setAttribute("style", "display:none")
    const websiteField = document.createElement("input")
    websiteField.type = "url"
    websiteField.value = websiteCell.textContent
    websiteField.spellcheck = false
    websiteField.className = "tiny-padding"
    websiteField.id = "websiteField"
    const websiteLabel = document.createElement("label")
    websiteLabel.htmlFor = "websiteField"
    websiteLabel.innerHTML = "Website"
    const usernameField = document.createElement("input")
    usernameField.type = "text"
    usernameField.value = usernameCell.textContent
    usernameField.spellcheck = false
    usernameField.className = "tiny-padding"
    usernameField.id = "usernameField"
    const usernameLabel = document.createElement("label")
    usernameLabel.htmlFor = "usernameField"
    usernameLabel.innerHTML = "Username"
    const passwordField = document.createElement("input")
    passwordField.type = "text"
    passwordField.value = passwordCell.textContent
    passwordField.spellcheck = false
    passwordField.className = "tiny-padding"
    passwordField.id = "passwordField"
    const passwordLabel = document.createElement("label")
    passwordLabel.htmlFor = "passwordField"
    passwordLabel.innerHTML = "Password"
    const webInputContainer = document.createElement("div")
    webInputContainer.className = "field border"
    const userInputContainer = webInputContainer.cloneNode()
    const passInputContainer = webInputContainer.cloneNode()
    webInputContainer.appendChild(websiteField)
    webInputContainer.appendChild(websiteLabel)
    userInputContainer.appendChild(usernameField)
    userInputContainer.appendChild(usernameLabel)
    passInputContainer.appendChild(passwordField)
    passInputContainer.appendChild(passwordLabel)
    websiteCell.replaceWith(webInputContainer)
    webInputContainer.parentElement.className = "no-padding"
    usernameCell.replaceWith(userInputContainer)
    userInputContainer.parentElement.className = "no-padding"
    passwordCell.replaceWith(passInputContainer)
    passInputContainer.parentElement.className = "no-padding"
    const cancelButton = document.createElement("button")
    cancelButton.innerHTML = "<i>cancel</i>"
    cancelButton.onclick = async (event) => {
        event.preventDefault()
        await createPasswordTable()
        newPasswordButton.removeAttribute("style")
    }
    cancelButton.className = "delete-cancel-button transparent circle"
    const saveButton = document.createElement("button")
    saveButton.innerHTML = "<i>save</i>"
    saveButton.className = "edit-save-button transparent circle"
    saveButton.onclick = async (event) => {
        if (await savePassword(event, websiteField.value, usernameField.value, passwordField.value, id) !== -1) {
            newPasswordButton.removeAttribute("style")
        }
    }
    const editPasswordForm = document.createElement("form")
    wrap(table, editPasswordForm)
    editButton.replaceWith(saveButton)
    deleteButton.replaceWith(cancelButton)
}

const getPasswords = async () => {
    const response = await fetch("/passwords", {
        method: "GET"
    })
    return response.text()
}

const createPasswordTable = async () => {
    const table = document.createElement("table")
    table.id = "passwordTable"
    table.className = "border"
    const head = table.createTHead()
    const headRow = head.insertRow()
    const headers = ["Website", "Username", "Password", "Strength"];
    headers.forEach((thisHeader) => {
        headRow.appendChild(document.createElement("th")).innerHTML = thisHeader
    })
    const body = table.createTBody();
    const passwordString = await getPasswords();
    const passwordArray = JSON.parse(passwordString)
    passwordArray.forEach((arrayElt, index) => {
        const bodyRow = body.insertRow()
        const websiteCell = bodyRow.insertCell()
        websiteCell.innerHTML = arrayElt.website
        const userCell = bodyRow.insertCell()
        userCell.innerHTML = arrayElt.username
        const passwordCell = bodyRow.insertCell()
        passwordCell.innerHTML = arrayElt.password
        const strengthCell = bodyRow.insertCell()
        strengthCell.innerHTML = arrayElt.strength
        strengthCell.className = "strengthCell"
        const editButton = document.createElement("button")
        editButton.innerHTML = "<i>edit</i>"
        editButton.onclick = (event) => editPassword(event, arrayElt.id, index)
        editButton.className = "edit-save-button transparent circle"
        const functionCell = bodyRow.insertCell()
        functionCell.appendChild(editButton)
        const deleteButton = document.createElement("button")
        deleteButton.onclick = () => deletePassword(arrayElt.id)
        deleteButton.innerHTML = "<i>delete</i>"
        deleteButton.className = "delete-cancel-button transparent circle"
        functionCell.appendChild(deleteButton)
    })

    const container = document.getElementById("passwordTableContainer")
    container.innerHTML = ""
    container.appendChild(table)
}
const setUserName = async () => {
    const header = document.getElementById("header")
    const mainContainer = document.getElementsByClassName("mainContainer")[0]
    const response = await fetch("/user", {
        method: "GET"
    })
    const accountContainer = document.createElement("div")
    accountContainer.className = "accountContainer bottom-margin"
    const userString = await response.text()
    const user = JSON.parse(userString)
    accountContainer.innerHTML = `<span><img src="${user.avatar_url}" class="circle tiny small-margin right-margin" alt="avatar image"> <span class="large-text">${user.username}</span></span> <button id="logout" class="small circle absolute right"><i>logout</i></button>`
    mainContainer.insertBefore(accountContainer, header)
}
window.onload = async function () {
    createPasswordTable()
    setUserName().then(() => {
        const logoutButton = document.getElementById("logout")
        logoutButton.onclick = () => {
            window.location.href = "/logout"
        }
    })
    const newPasswordButton = document.getElementById("newPassword");
    newPasswordButton.onclick = createPassword
}
const fs = require('fs/promises');
const path = require("path");
const { nanoid } = require("nanoid");
const contactsPath = path.join(__dirname,  "contacts.json");

const listContacts = async () => {
 const contacts = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(contacts);
}

const getContactById = async (contactId) => {
   const data = await listContacts();
   return data.find((contact) => contact.id === contactId);
}

const removeContact = async (contactId) => {
   const data = await listContacts();
   const index = data.findIndex(contact => contact.id === contactId);
   if (index === -1) {
      return null;
    }
    const [result] = data.splice(index, 1);
    await fs.writeFile(contactsPath, JSON.stringify(data, null, 2));
    return result;
}

const addContact = async (body) => {
   const data = await listContacts();
    const newContact = {
        id: nanoid(),
        ...body,
    };
    data.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(data, null, 2));
    return newContact;
}

const updateContact = async (contactId, body) => {
  const data = await listContacts();
  const index = data.findIndex(contact => contact.id === contactId);
  if(index === -1){
      return null;
    }
  data[index] = {...data[index],...body};
  await fs.writeFile(contactsPath, JSON.stringify(data, null, 2));
  return data[index];
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}

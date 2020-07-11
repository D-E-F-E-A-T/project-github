import React, { useContext, useState, useEffect } from 'react';

import api from '../../services/api';
import apiDB from '../../services/apiDB';

import { AuthContext } from "../../App";
import Header from '../../components/Header';
import { Wrapper } from './styles';

const StarredRepositories = () => {

  // data
  const {state, dispatch} = useContext(AuthContext);
  const [starredRepositories, setStarredRepositories] = useState([])
  const [repositoryWithTags, setRepositoryWithTags] = useState([])
  const [page, setPage] = useState(1)

  let currentID = ''

  useEffect(() => {
    async function getInformationDB() {
      const { data } = await apiDB.get(`/starred-repositories/${state.user.id}`)
      
      let result = data.map(item => [item.repo_id, item.tags, item.id])
      setRepositoryWithTags(result)
    }

    getInformationDB()

  }, [state.user.id, repositoryWithTags])

  useEffect(() => {
    const user = state.user.login;
    const btnPrev = document.querySelector('.btn-prev')
    const btnNext = document.querySelector('.btn-next')

    if(page === 1) {
      btnPrev.disabled = true;
    } else {
      btnPrev.disabled = false;
    }

    async function loadRepositories() {
      const response = await api.get(`users/${user}/starred?page=${page}&per_page=10`);
      
      if(response.data.length === 0) {
        btnNext.disabled = true;
      } else {
        btnNext.disabled = false;
      }

      const data = response.data
      setStarredRepositories(data);
    }

    loadRepositories();
  }, [page, state.user.login])

  async function handleAddTag(event) { 
    let user_id = String(state.user.id);
    let repo_id = event.target.parentNode.parentNode.id;
    let tags = prompt(`insert tag name`);
    
    if(tags) {
      let data = {
        user_id,
        repo_id,
        tags
      }
      
      const response = await apiDB.post('/starred-repositories', data)
      let { id, repo_id: repo, tags: tagRepo } = response.data
      
      const newTags = {
        id,
        repo,
        tagRepo
      }

      setRepositoryWithTags([...repositoryWithTags, newTags])
    }
  }

  async function handleEditTag() {
    let tags = document.querySelector('.modal-edit-delete input').value

    if(!tags) {
      alert('Enter a tag name')
      return
    }
    let data = {
      id: currentID,
      tags
    }
    
    const response = await apiDB.put(`/starred-repositories`, data )
    let { id, repo_id: repo, tags: tagRepo } = response.data

    const newTags = {
      id,
      repo,
      tagRepo
    }

    if(response.status === 200) {
      handleCloseModal()
    }

    setRepositoryWithTags([...repositoryWithTags, newTags])
  }

  async function handleRemoveTag() {

    let id = currentID 
    const response = await apiDB.delete(`/starred-repositories/${id}`)
    console.log(response);

    if(response.status === 200) {
      handleCloseModal()
    }
  }

  function handleOpenModal(event) {

    currentID = event.target.dataset.id

    let wrapper = document.querySelector('.wrapper')
    let divModal = document.createElement('div');
    let div = document.createElement('div');
    let input = document.createElement('input');
    let btnEdit = document.createElement('button');
    let btnDelete = document.createElement('button');
    let btnExit = document.createElement('button');
    
    divModal.classList = 'modal-edit-delete';
    input.placeholder = 'Tag name';

    btnEdit.innerHTML = 'Edit';
    btnEdit.onclick = () => handleEditTag();

    btnDelete.innerHTML = 'Delete';
    btnDelete.onclick = () => handleRemoveTag();

    btnExit.innerHTML = 'x';
    btnExit.classList = 'close-modal'
    btnExit.onclick = () => handleCloseModal();

    div.appendChild(input)
    div.appendChild(btnEdit)
    div.appendChild(btnDelete)
    div.appendChild(btnExit)
    divModal.appendChild(div)
    wrapper.appendChild(divModal)
  }

  function handleCloseModal() {
    let modal = document.querySelector('.modal-edit-delete')
    modal.remove();
  }

  function handlePrevPage() {
    if(page !== 1) {
      setPage(page - 1)
    }
  }

  function handleNextPage() {  
    setPage(page + 1)
  }
  
  return (
    <Wrapper className='wrapper'>
      <Header />

      <div className='title-and-seach'>
        <h2 className='title'>Starred Repositories</h2>
        <input 
          type='text'
          name='search'
          placeholder='Search tags'
        />
      </div>
      
      {starredRepositories.map(repository => (    
        <div key={repository.id} className='box-repositories' id={repository.id}>
          <p><span>ID:</span> {repository.id}</p>
          <p><span>Name:</span> {repository.name}</p>
          <p><span>Description:</span> {repository.description}</p>
          <p><span>URL:</span> <a href={repository.html_url} target='_blank'>{repository.html_url}</a> </p>

          <div className='box-btn-tags'>
            <button onClick={handleAddTag}>add tag</button>
            <div data-test={repository.id} className='box-tags'>
         
              {repositoryWithTags.map(item => (
                 item[0] == repository.id     
                 ? <span 
                    key={item[2]} 
                    data-id={item[2]}
                    data-user_id={state.user.id}
                    data-repo_id={repository.id}
                    data-tags={item[1]}
                    onClick={handleOpenModal}
                    >
                      {item[1]}
                    </span> 
                 : ' '
              ))}

            </div>
          </div>
        </div>
      ))}

      <div className='box-buttons-navigation'>
        <button className='btn-prev' onClick={handlePrevPage}>Prev</button>
        <button className='btn-next' onClick={handleNextPage}>Next</button>
      </div>
    </Wrapper>
  )
}

export default StarredRepositories;
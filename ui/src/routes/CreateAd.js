import React, {useEffect, useState} from "react";
import {Box, Collapse, InputAdornment, MenuItem} from "@material-ui/core";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LocalizedDropzoneArea from '../components/LocalizedDropzoneArea';
import {Alert} from "@mui/material";
import AuthService from '../services/auth.service';
import {Redirect} from "react-router-dom";
import axios from 'axios';
import authHeader from "../services/auth-header";

const FormData = require('form-data');

const API_URL = "http://localhost:8080/";

const CreateAdImpl = props => {
    const { history } = props;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');

    const [metroList, setMetroList] = useState([]);
    const [metro, setMetro] = useState('');

    const [categoryList, setCategoryList] = useState([]);
    const [category, setCategory] = useState('');

    const [subcategoryList, setSubcategoryList] = useState([]);
    const [subcategory, setSubcategory] = useState('');

    const [alertOpen, setAlertOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [imgs, setImgs] = useState(null);

    const { _, userId, } = AuthService.getUser();

    useEffect(() => {
        axios
            .get(API_URL + "metro", { headers: authHeader() })
            .then(res => {
                setMetroList(res.data);
            })
    }, []);

    useEffect(() => {
        axios
            .get(API_URL + "category", { headers: authHeader() })
            .then(res => {
                setCategoryList(res.data);
            })
    }, []);

    useEffect(() => {
        axios
            .get(API_URL + "category/" + category, { headers: authHeader() })
            .then(res => {
                setSubcategoryList(res.data);
                setSubcategory('');
            })
    }, [category]);

    const handleSubmit = e => {
        e.preventDefault();
        if (name.length < 3 || name.length > 50) {
            setErrorMessage("Название объявления должно быть длиной от 3 до 50 символов");
            setAlertOpen(true);
            return;
        }

        axios
            .post(API_URL + "ad", {
                name: name,
                description: description,
                price: price,
                saler: {
                    id: userId
                },
                metro: {
                    id: metro
                },
                subCategory: {
                    id: subcategory
                },
                isActive: true
            }, { headers: authHeader() })
            .then(res => {
                for (var img of imgs) {
                    const data = new FormData();
                    data.append('file', img);
                    data.append('imageJson', JSON.stringify({ ad: { id: res.data.id } }));

                    var config = {
                        method: 'post',
                        url: API_URL + "image/upload",
                        headers: {
                            ...authHeader()
                        },
                        data: data
                    };

                    axios(config);
                }
                history.push('/my-ads');
            })
    };

    return (
        <Box
            display='flex'
            flexDirection='column'
            justifyContent='space-between'
            sx={{ mt: 2, width: '50%', m: 'auto' }}
        >
            <Collapse in={alertOpen}>
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {errorMessage}
                </Alert>
            </Collapse>

            <TextField
                id="adNameTextField"
                label="Название"
                variant="filled"
                fullWidth
                onChange={e => {
                    setName(e.target.value);
                    setAlertOpen(false);
                }}
                value={name}
            />

            <TextField
                id="priceTextField"
                label="Цена"
                variant="filled"
                type="number"
                fullWidth
                InputProps={{
                    endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                }}
                onChange={e => {
                    if (e.target.value >= 0 && e.target.value <= 99999999) {
                        setPrice(e.target.value);
                    }
                }}
                value={price}
            />

            <TextField
                id="descriptionTextField"
                label="Описание"
                variant="filled"
                multiline
                maxRows={8}
                minRows={8}
                onChange={e => {
                    setDescription(e.target.value);
                    setAlertOpen(false);
                }}
                value={description}
                fullWidth
            />

            <TextField
                id="metroTextField"
                select
                variant="filled"
                label="Метро"
                value={metro}
                onChange={e => {
                    setMetro(e.target.value);
                }}
            >
                {metroList.map(metro => {
                    return (
                        <MenuItem key={metro.id} value={metro.id}>
                            {metro.name}
                        </MenuItem>);
                })}
            </TextField>

            <TextField
                id="categoryTextField"
                select
                variant="filled"
                label="Категория"
                value={category}
                onChange={e => {
                    const value = e.target.value;
                    setCategory(value);
                    setSubcategory('');
                }}
            >
                {categoryList.map(category => {
                    return (
                        <MenuItem
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </MenuItem>);
                })}
            </TextField>

            <TextField
                id="subcategoryTextField"
                disabled={!category}
                select
                variant="filled"
                label="Подкатегория"
                value={subcategory}
                onChange={e => {
                    const value = e.target.value;
                    setSubcategory(value);
                }}
            >
                {subcategoryList.map(subcategory => {
                    return (
                        <MenuItem
                            key={subcategory.id}
                            value={subcategory.id}
                        >
                            {subcategory.name}
                        </MenuItem>);
                })}
            </TextField>

            <LocalizedDropzoneArea
                id="localizedDropzoneArea"
                filesLimit={3}
                maxFileSize={3145728} // 3 mb
                acceptedFiles={[".jpeg", ".jpg"]}
                onChange={files => { setImgs(files); }}
            />

            <Button
                id="submitButton"
                type="submit"
                variant="contained"
                color="primary"
                onClick={(e) => handleSubmit(e)}
                fullWidth
                style={{ marginTop: 20 }}
                disabled={!name || !description || !price || !metro || !category || !subcategory || imgs.length === 0}
            >
                Создать
            </Button>
        </Box >
    )
}

const CreateAd = props => {
    if (!AuthService.getUser()) {
        return <Redirect to="/login" />
    }

    return <CreateAdImpl history={props.history} />
};

export default CreateAd;

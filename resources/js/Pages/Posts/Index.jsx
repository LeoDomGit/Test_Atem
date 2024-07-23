import React, { useState } from "react";
import Layout from "../../components/Layout";
import { Dropzone, FileMosaic } from "@dropzone-ui/react";
import CKEditor from "../../components/CKEditor";
import Switch from "@mui/material/Switch";
import { DataGrid } from "@mui/x-data-grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import axios from "axios";
function Index({ cates, products, posts }) {
    const notyf = new Notyf({
        duration: 1000,
        position: {
            x: "right",
            y: "top",
        },
        types: [
            {
                type: "warning",
                background: "orange",
                icon: {
                    className: "material-icons",
                    tagName: "i",
                    text: "warning",
                },
            },
            {
                type: "error",
                background: "indianred",
                duration: 2000,
                dismissible: true,
            },
            {
                type: "success",
                background: "green",
                color: "black",
                duration: 2000,
                dismissible: true,
            },
            {
                type: "info",
                background: "#24b3f0",
                color: "black",
                duration: 1500,
                dismissible: false,
                icon: '<i class="bi bi-bag-check"></i>',
            },
        ],
    });
    const [title, setTitle] = useState("");
    const [datacate, setDataCate] = useState(cates);
    const [create, setCreate] = useState(false);
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [categories, setCategories] = useState(cates);
    const [files, setFiles] = React.useState([]);
    const [idProducts, setIdProducts] = useState([]);
    const [data,setData]= useState(posts);
    const [dataproducts,setDataProduct]= useState(products);
    const [idCate, setIdCate] = useState(0);
    const [idPost,setIdPost]= useState(null);
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };
    const handleEditClick = (item)=>{
		setTitle(item.title)
		setSummary(item.summary);
		setFiles([]);
		setContent(item.content);
		setIdCate(item.id_collection);
        setIdPost(item.id);
        axios.post('posts/'+item.id).then((res)=>{
            setIdProducts(res.data);
        })
		setCreate(true);
	}
    const handleParentChange1 = (id,value)=>{
        axios.put("/posts/" + id, {
            id_collection:value
        }).then((res) => {
            if (res.data.check == false) {
                if (res.data.msg) {
                    notyf.open({
                        type: "error",
                        message: res.data.msg,
                    });
                }
            } else if (res.data.check == true) {
                notyf.open({
                    type: "success",
                    message: "Chuyển nhóm danh mục thành công",
                });
                setData(res.data.data);
                console.log(res.data.data);
            }
        });
      }

      const handleCellEditStop = (id, field, value) => {
        if(value!=''){
            axios
            .put(
              `/posts/${id}`,
              { [field]: value },
            )
            .then((res) => {
              if (res.data.check == true) {
                notyf.open({
                  type: "success",
                  message: "Chỉnh sửa dịch vụ thành công",
                });
                setData(res.data.data);

              } else if (res.data.check == false) {
                notyf.open({
                  type: "error",
                  message: res.data.msg,
                });
              }
            });
        }

      };
    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'title', headerName: 'Tiêu đề bài viết', width: 200,editable:true },
        { field: 'slug', headerName: 'Slug', width: 200,editable:false },
        { field: 'summary', headerName: 'Tóm tắt', width: 300,editable:true },
        {
          field: 'id_collection', headerName: "Danh mục bài viết", width: 200, renderCell: (params) => (
            <Select
              defaultValue={params.value}
              className='w-100'
              onChange={(e) => handleParentChange1(params.id, e.target.value)}
            >
              <MenuItem value={null}>None</MenuItem>
              {categories.map((parent) => (
                <MenuItem key={parent.id} value={parent.id}>{parent.name}</MenuItem>
              ))}
            </Select>
          )
        },
        {
          field: 'status',
          headerName: 'Status',
          width: 200,
          renderCell: (params) => (
            <Switch
              checked={params.value == 1}
              onChange={(e) => switchService(params, e.target.checked ? 1 : 0)}
              inputProps={{ "aria-label": "controlled" }}
            />
          ),
        },
        {
          field: 'highlight',
          headerName: 'Highlight',
          width: 200,
          renderCell: (params) => (
            <Switch
              checked={params.value == 1}
              onChange={(e) => switchService(params, e.target.checked ? 1 : 0)}
              inputProps={{ "aria-label": "controlled" }}
            />
          ),
        },
        {
            headerName: "Chi tiết",
            width: 70,
            renderCell: (params) => (
                <a href={'#'} onClick={(e)=>handleEditClick(params.row)} className="btn btn-sm btn-warning">Edit</a>
            ),
        },
      ];
    const resetCreate=()=>{
        setTitle('');
        setSummary('')
        setFiles([])
        setTitle('')
        setContent('');
        setIdCate(0);
        setCreate(true);
    }
    const submitEditPost= ()=>{
        if (
            title == "" ||
            summary == "" ||
            idCate == 0 ||
            content == ""
        ) {
            notyf.open({
                type: "error",
                message: "Thiếu nội dung bài viết",
            });
        } else {
            var formData = new FormData();
            formData.append("title", title);
            formData.append("summary", summary);
            formData.append("content", content);
            if(files.length>0){
                formData.append("file", files[0].file);
            }
            formData.append("id_collection", idCate);
            idProducts.forEach((el) => {
                formData.append("products[]", Number(el));
            });
            axios.post("/update-post/"+idPost, formData).then((res) => {
                if (res.data.check == true) {
                    notyf.open({
                        type: "success",
                        message: "Sửa bài viết thành công",
                    });
                    resetCreate();
                    setCreate(false);
                    setData(res.data.data)
                } else {
                    if (res.data.msg) {
                        notyf.open({
                            type: "error",
                            message: res.data.msg,
                        });
                    }
                }
            });
        }
    }
    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setIdProducts(typeof value === "string" ? value.split(",") : value);
    };
    const submitPost = () => {
        if (
            title == "" ||
            summary == "" ||
            idCate == 0 ||
            content == "" ||
            files.length == 0 ||
            idProducts.length == 0
        ) {
            notyf.open({
                type: "error",
                message: "Thiếu nội dung bài viết",
            });
        } else {
            var formData = new FormData();
            formData.append("title", title);
            formData.append("summary", summary);
            formData.append("content", content);
            formData.append("file", files[0].file);
            formData.append("id_collection", idCate);
            idProducts.forEach((el) => {
                formData.append("products[]", Number(el));
            });
            axios.post("/posts", formData).then((res) => {
                if (res.data.check == true) {
                    notyf.open({
                        type: "success",
                        message: "Thêm bài viết thành công",
                    });
                    resetCreate();
                    setCreate(false);
                    setData(res.data.data)
                } else {
                    if (res.data.msg) {
                        notyf.open({
                            type: "error",
                            message: res.data.msg,
                        });
                    }
                }
            });
        }
    };
    function switchService(params, value) {
        var field = params.field;
        axios
            .put(
                "/posts/" + params.id,
                {
                  [field]: value,
                }
            )
            .then((res) => {
                if (res.data.check == false) {
                    if (res.data.msg) {
                        notyf.open({
                            type: "error",
                            message: res.data.msg,
                        });
                    }
                } else if (res.data.check == true) {
                    notyf.open({
                        type: "success",
                        message: "Switch successfully",
                    });
                    setData(res.data.data);
                }
            });
    }
    const updateFiles = (incommingFiles) => {
        setFiles(incommingFiles);
    };
    return (
        <Layout>
            <>
                <div className="row">
                    <div className="col-md-3">
                        {create && (
                            <button className="btn btn-secondary" onClick={(e)=>setCreate(false)}>Hủy</button>
                        )}
                        {!create&& (
                        <button className="btn btn-primary" onClick={(e)=>resetCreate()}>Thêm</button>
                        )}
                    </div>
                </div>
                {create && (
                    <div className="row mt-3">
                        <div className="col-md-6">
                            <div class="card shadow">
                                <div class="card-body">
                                    <div className="input-group mb-3">
                                        <span
                                            className="input-group-text"
                                            id="basic-addon1"
                                        >
                                            Tiêu đề
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tiêu đề"
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            aria-label="Tiêu đề"
                                            aria-describedby="basic-addon1"
                                        />
                                    </div>
                                    <div className="input-group mb-3">
                                        <span
                                            className="input-group-text"
                                            id="basic-addon1"
                                        >
                                            Tóm tắt
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tóm tắt"
                                            aria-label="Tóm tắt"
                                            value={summary}
                                            onChange={(e) =>
                                                setSummary(e.target.value)
                                            }
                                            aria-describedby="basic-addon1"
                                        />
                                    </div>
                                    <div className="input-group mb-3">
                                        <span
                                            className="input-group-text"
                                            id="basic-addon1"
                                        >
                                            Nhóm bài viết
                                        </span>
                                        <select
                                            name=""
                                            className="form-control"
                                            id=""
                                            defaultValue={idCate}
                                            onChange={(e) =>
                                                setIdCate(e.target.value)
                                            }
                                        >
                                            <option value="0">
                                                Chọn loại bài viết
                                            </option>
                                            {datacate.length > 0 &&
                                                datacate.map((item, index) => (
                                                    <option value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="row mb-3">
                                        <label htmlFor="">
                                            Sản phẩm trong bài viết
                                        </label>
                                        <FormControl
                                            sx={{
                                                m: 1,
                                                width: 300,
                                            }}
                                        >
                                            <Select
                                                labelId="demo-multiple-name-label"
                                                id="demo-multiple-name"
                                                multiple
                                                value={idProducts}
                                                onChange={handleChange}
                                                input={
                                                    <OutlinedInput label="Name" />
                                                }
                                                MenuProps={MenuProps}
                                            >
                                                {products.map((item) => (
                                                    <MenuItem
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-4 ">
                                            <Dropzone
                                                onChange={updateFiles}
                                                value={files}
                                            >
                                                {files.map((file) => (
                                                    <FileMosaic
                                                        {...file}
                                                        preview
                                                    />
                                                ))}
                                            </Dropzone>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md">
                                            <CKEditor value={content} onBlur={setContent} />
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <div className="row">
                                        <div className="col-md text-end">
                                      {!idPost && (
                                          <button
                                          onClick={(e) => submitPost()}
                                          className="btn btn-primary"
                                      >
                                          Thêm
                                      </button>
                                      )}
                                      {idPost && (
                                          <button
                                          onClick={(e) => submitEditPost()}
                                          className="btn btn-primary"
                                      >
                                          Sửa
                                      </button>
                                      )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {!create && (
                <div className="row mt-3" >
                   <div className="col-md">
                   <DataGrid
                  rows={data}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5]}
                  checkboxSelection
                  disableRowSelectionOnClick
                  onCellEditStop={(params, e) =>
                    handleCellEditStop(
                      params.row.id,
                      params.field,
                      e.target.value
                    )
                  }
                />
                   </div>
                </div>
                )}
            </>
        </Layout>
    );
}

export default Index;

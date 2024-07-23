import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Select, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Notyf } from "notyf";
import { Box, Switch, Typography } from "@mui/material";
import { DataGrid, GridToolbar, GridActionsCellItem } from "@mui/x-data-grid";
import "notyf/notyf.min.css";
import CKEditor from "../../components/CKEditor";
import Swal from "sweetalert2";
import axios from "axios";

function Index({ sitemap }) {
	const options = {
		filebrowserImageBrowseUrl: "/laravel-filemanager?type=Images",
		filebrowserImageUploadUrl: "/laravel-filemanager/upload?type=Images&_token=",
		filebrowserBrowseUrl: "/laravel-filemanager?type=Files",
		filebrowserUploadUrl: "/laravel-filemanager/upload?type=Files&_token=",
	};
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
				color: "white",
				duration: 2000,
				dismissible: true,
			},
			{
				type: "info",
				background: "#24b3f0",
				color: "white",
				duration: 1500,
				dismissible: false,
				icon: '<i class="bi bi-bag-check"></i>',
			},
		],
	});
	const [page, setPage] = useState("");
	const [staticpage, setStatic] = useState(1);
	const [content, setContent] = useState("");
	const [show, setShow] = useState(false);
	const [idsitemap, setIdSitemap] = useState(null);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const [url, setUrl] = useState("");
	const [data, setData] = useState("");
	const [create, setCreate] = useState(false);

	const resetCreate = () => {
		setPage("");
		window.CKEDITOR.replace("content", options);
		setStatic(null);
		setContent("");
		setShow(true);
	};
	const handleEditClick = (item)=>{
		setUrl(item.url)
		setIdSitemap(item.id);
		setPage(item.page);
		setContent(item.content);
		setStatic(item.static_page);
		setShow(true);
	}
	useEffect(() => {
		setData(sitemap);
	}, [sitemap]);
	const submitEditPage =()=> {
		if (page == "") {
			notyf.open({
				type: "error",
				message: "Thiếu tên trang",
			});
		} else if (staticpage == 1 && content == "") {
			notyf.open({
				type: "error",
				message: "Vui lòng nhập content của trang",
			});
		} else if (url == "") {
			notyf.open({
				type: "error",
				message: "Thiếu đường dẫn",
			});
		} else {
			axios
				.put("/sitemap/"+idsitemap, {
					page: page,
					content: content,
					url: url,
					static_page: staticpage,
				})
				.then((res) => {
					if (res.data.check == true) {
						notyf.open({
							type: "success",
							message: "Sửa thành công",
						});
						resetCreate();
						setData(res.data.data);
						setShow(false);
					} else if (res.data.check == false) {
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
	const submitPage = () => {
		if (page == "") {
			notyf.open({
				type: "error",
				message: "Thiếu tên trang",
			});
		} else if (staticpage == 1 && content == "") {
			notyf.open({
				type: "error",
				message: "Vui lòng nhập content của trang",
			});
		} else if (url == "") {
			notyf.open({
				type: "error",
				message: "Thiếu đường dẫn",
			});
		} else {
			axios
				.post("/sitemap", {
					page: page,
					content: content,
					url: url,
					static_page: staticpage,
				})
				.then((res) => {
					if (res.data.check == true) {
						notyf.open({
							type: "success",
							message: "Thêm thành công",
						});
						resetCreate();
						setData(res.data.data);
						setShow(false);
					} else if (res.data.check == false) {
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

	const handleCellEditStop = (id, field, value) => {
		axios.put(`/sitemap/${id}`, { [field]: value }).then((res) => {
			if (res.data.check == true) {
				notyf.open({
					type: "success",
					message: "Chỉnh sửa thành công",
				});
				setData(res.data.data);
			} else if (res.data.check == false) {
				notyf.open({
					type: "error",
					message: res.data.msg,
				});
			}
		});
	};
	const columns = [
		{ field: "id", headerName: "ID", width: 70 },
		{ field: "page", headerName: "Page", width: 200, editable: true },
		{ field: "url", headerName: "Url", width: 250, editable: true },
		{ field: "content", headerName: "Content", width: 250, editable: false },
		{
			field: "status",
			headerName: "Status",
			width: 150,
			renderCell: (params) => <Switch checked={params.value == 1} onClick={(event) => handleCellEditStop(params.row.id, "status", event.target.checked ? 1 : 0)} />,
		},
		{
			field: "static_page",
			headerName: "Static Page",
			width: 150,
			editable: true,
			renderCell: (params) => (
				<Select value={params.value} onChange={(event) => handleCellEditStop(params.row.id, "static_page", event.target.value)}>
					<MenuItem value={1}>Trang Tĩnh</MenuItem>
					<MenuItem value={0}>Trang Link</MenuItem>
				</Select>
			),
		},
		{
			field: "action",
			headerName: "Action",
			width: 150,
			renderCell: (params) => <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleEditClick(params.row)} showInMenu={false} color="inherit" />,
		},
	];

	return (
		<>
			<Layout>
				<div className="container-fluid">
					<div className="row mb-3">
						<div className="col-md-3">
							<button onClick={(e) => resetCreate()} className="btn btn-primary">
								Tạo
							</button>
						</div>
					</div>
					<Modal show={show} size="xl" onHide={handleClose} backdrop="static" keyboard={false}>
						<Modal.Header closeButton>
							<Modal.Title>Page modal</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<div className="row">
								<div className="col-md">
									<div class="card shadow">
										<div class="card-body">
											<div className="row">
												<div className="col-md-12">
													<div className="input-group mb-3">
														<span className="input-group-text" id="basic-addon1">
															Tên trang
														</span>
														<input type="text" className="form-control" placeholder="Tên trang" value={page} onChange={(e) => setPage(e.target.value)} aria-label="Tên trang" aria-describedby="basic-addon1" />
													</div>
												</div>
												<div className="col-md-12">
													<div className="input-group mb-3">
														<span className="input-group-text" id="basic-addon1">
															URL
														</span>
														<input type="text" className="form-control" onChange={(e) => setUrl(e.target.value)} value={url} placeholder="URL ..." aria-label="URL ..." aria-describedby="basic-addon1" />
													</div>
												</div>
												<div className="col-md-12">
													<div className="input-group mb-3">
														<span className="input-group-text" id="basic-addon1">
															Static page
														</span>
														<select name="" onChange={(e) => setStatic(e.target.value)} defaultValue={staticpage} className="form-control" id="">
															<option value={null}>Chọn loại trang </option>
															<option value={1}>Trang tĩnh </option>
															<option value={0}>Trang link </option>
														</select>
													</div>
												</div>
											</div>
											<div className="row">
												<div className="col-md">
													<CKEditor onBlur={setContent} value={content} />
												</div>
											</div>
										</div>
										<div class="card-footer text-muted"></div>
									</div>
								</div>
							</div>
						</Modal.Body>
						<Modal.Footer>
							{!idsitemap && (
							<button className="btn btn-primary" onClick={(e) => submitPage()}>
								Thêm
							</button>
							)}
							{idsitemap && (
							<button className="btn btn-warning" onClick={(e) => submitEditPage()}>
								Sửa
							</button>
							)}

						</Modal.Footer>
					</Modal>
					<Box sx={{ height: 400, width: "100%" }}>
						<DataGrid
							rows={data}
							columns={columns}
							slots={{
								toolbar: GridToolbar,
							}}
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
							onCellEditStop={(params, e) => handleCellEditStop(params.row.id, params.field, e.target.value)}
						/>
					</Box>
				</div>
			</Layout>
		</>
	);
}

export default Index;

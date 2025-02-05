import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
// import * as saveAs from 'file-saver';
import { saveAs } from 'file-saver-es';
import { BillService } from 'src/app/service/bill.service';
import { CategoryService } from 'src/app/service/category.service';
import { ProductService } from 'src/app/service/product.service';
import { CustomerService } from 'src/app/service/customer.service';
import { SnackbarService } from 'src/app/service/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.scss']
})

export class ManageOrderComponent implements OnInit {
  displayedColumns: string[] = ['name', 'category', 'price', 'quantity', 'total', 'edit'];
  dataSource: any = [];
  manageOrderForm: any = FormGroup;
  categorys: any = [];
  products: any = [];
  contactNumbers: any = [];
  price: any;
  totalAmount: number = 0;
  responseMessage: any;

  constructor(
    private formBulider: FormBuilder,
    private categoryService: CategoryService,
    private productService: ProductService,
    private customerService: CustomerService,
    private billService: BillService,
    private dialog: MatDialog,
    private SnackbarService: SnackbarService,
    private router: Router) { }

  ngOnInit(): void {
    this.getContactNumbers();
    this.getCategorys();
    this.manageOrderForm = this.formBulider.group({
      username: [null, [Validators.required, Validators.pattern(GlobalConstants.nameRegex)]],
      contactNumber: [null, [Validators.required]],
      address: [null, [Validators.required]],
      paymentMethod: [null, [Validators.required]],
      product: [null, [Validators.required]],
      category: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      price: [null, [Validators.required]],
      total: [0, [Validators.required]]
    });
  }

  getContactNumbers() {
    this.customerService.getContactNumbers().subscribe((response: any) => {
      this.contactNumbers = response;
    }, (error: any) => {
      console.log(error.error?.message);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.SnackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

  getCategorys() {
    this.categoryService.getCategorys().subscribe((response: any) => {
      this.categorys = response;
    }, (error: any) => {
      console.log(error.error?.message);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.SnackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

  getProductsByCategory(value: any) {
    this.productService.getProductByCategory(value.id).subscribe((response: any) => {
      this.products = response;
      this.manageOrderForm.controls['price'].setValue('');
      this.manageOrderForm.controls['quantity'].setValue('');
      this.manageOrderForm.controls['total'].setValue(0);
    }, (error: any) => {
      console.log(error.error?.message);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.SnackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

  getProductDetails(value: any) {
    //console.log("inside getProductDetails");
    this.productService.getProductById(value.id).subscribe((response: any) => {
      this.price = response.price;
      this.manageOrderForm.controls['price'].setValue(this.price);
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(this.price);
    }, (error: any) => {
      console.log(error.error?.message);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.SnackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

  getCustomerDetails(value: any) {
    
    this.customerService.getCustomerById(value.id).subscribe((response: any) => {
      this.manageOrderForm.controls['username'].setValue(response.username);
      this.manageOrderForm.controls['address'].setValue(response.address);
    }, (error: any) => {
      console.log(error.error?.message);
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }
      this.SnackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    })
  }

  setQuantity(value: any) {
    var temp = this.manageOrderForm.controls['quantity'].value;
    if (temp > 0) {
      this.manageOrderForm.controls['total'].setValue(this.manageOrderForm.controls['quantity'].value * this.price); //this.manageOrderForm.controls['price'].value
    } else if (temp != '') {
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(this.price);
    }
  }

  validateProductAdd() {
    var fromData = this.manageOrderForm.value;

    //var totalValue = this.manageOrderForm.contols['total'].value;
    var Value = this.manageOrderForm.controls['price'].value;
    if ( Value === null || fromData?.product?.total === 0 || fromData?.product?.total === '' || fromData?.product?.quantity <= 0) {
      return true;
    } else {
      return false;
    }
  }


  validateSubmit() {
    var formData = this.manageOrderForm.value;
    if (this.totalAmount === 0 || formData.product.name === null ||
    formData.contactNumber === null || formData.paymentMethod === null) {
      return true;
    } else {
      return false;
    }
  }

  add() {
    var fromData = this.manageOrderForm.value;
    var productName = this.dataSource.find((e:{id: number}) => e.id === fromData.product.id);
    if (productName === undefined) {
      this.totalAmount = this.totalAmount + fromData.total;
      this.dataSource.push({id: fromData.product.id, name: fromData.product.name, category: fromData.category.name, quantity: fromData.quantity, price: fromData.price, total: fromData.total});
      this.dataSource = [...this.dataSource];
      //alert("Order Added Successfully");
      this.SnackbarService.openSnackBar(GlobalConstants.productAdded, "Success");
    } else {
      this.SnackbarService.openSnackBar(GlobalConstants.productExistError, GlobalConstants.error);
    }
  }

  handleDeleteAction(value: any, element: any) {
    this.totalAmount = this.totalAmount = element.total;
    this.dataSource.splice(value,1);
    this.dataSource = [...this.dataSource];
  }

  submitAction() {
    var formData = this.manageOrderForm.value;
    var data = {
      username: formData.username,
      contactNumber: formData.contactNumber.contactNumber,
      address: formData.address,
      paymentMethod: formData.paymentMethod,
      totalAmount: this.totalAmount.toString(),
      productDetails: JSON.stringify(this.dataSource)
    }

    this.billService.generateReport(data).subscribe((resonse: any) => {
      this.downloadFile(resonse?.uuid);
      this.manageOrderForm.reset();
      this.dataSource = [];
      this.totalAmount = 0;
      }, (error: any) => {
        console.log(error.error?.message);
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = GlobalConstants.genericError;
        }
        this.SnackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
      })
  }

  downloadFile(fileName: string) {
    var data = {
      uuid: fileName
    }
    this.billService.getPdf(data).subscribe((resonse: any) => {
        saveAs(resonse, fileName + ".pdf");
    })
  }
}


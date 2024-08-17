import { NextFunction, Response } from "express";
import axios from "axios";
import createHttpError from "http-errors";
// models
import { AddressModel } from "../../../DB/Models";
// types
import { IRequest } from "../../../types";
import { env } from "../../Utils";

/**
 * @api {POST} /addresses/add  add a new address
 */
export const addAddress = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  // destructuring the request body
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    setAsDefault,
  } = req.body;

  const { userId } = req;
  try {
    // create new Address instance
    const newAddress = new AddressModel({
      userId,
      country,
      city,
      postalCode,
      buildingNumber,
      floorNumber,
      addressLabel,
      isDefault: [true, false].includes(setAsDefault) ? setAsDefault : false,
    });

    // cities validation
    const cities = await axios.get(
      "https://api.api-ninjas.com/v1/city?country=EG&limit=30",
      { headers: { "X-Api-Key": env.CITY_API_KEY } }
    );
    const isCityExist = cities.data.find(
      (c: any) => c.name.toLowerCase() === city.toLowerCase()
    );
    if (!isCityExist) {
      throw createHttpError(404, "City not found");
    }

    // if the new address is default, we need to update the old default address to be not default
    if (newAddress.isDefault) {
      await AddressModel.updateOne(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    // Save New Address To Database =>
    await newAddress.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Address created successfully",
      data: newAddress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 *  @api {PUT} /addresses/edit/:addressId  Edit address by id
 */
export const editAddress = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    setAsDefault,
  } = req.body;

  const { userId } = req;
  const { addressId } = req.params;

  try {
    // find address in database by id of logged in user and addressId
    const address = await AddressModel.findOne({
      _id: addressId,
      userId,
      isMarkedAsDeleted: false,
    });

    // check if address not found in database
    if (!address) {
      throw createHttpError(404, "Address not found");
    }

    // update address fields you want
    if (country) address.country = country;
    if (city) address.city = city;
    if (postalCode) address.postalCode = postalCode;
    if (buildingNumber) address.buildingNumber = buildingNumber;
    if (floorNumber) address.floorNumber = floorNumber;
    if (addressLabel) address.addressLabel = addressLabel;

    if (setAsDefault) {
      address.isDefault = [true, false].includes(setAsDefault)
        ? setAsDefault
        : false;

      await AddressModel.updateOne(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    // Save New Address To Database =>
    await address.save();

    // send the response
    res.status(201).json({
      status: "success",
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 *  @api {GET} /addresses Get all addresses
 */
export const getAllAddresses = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  try {
    // find all addresses in database by id of logged in user
    const addresses = await AddressModel.find({
      userId,
      isMarkedAsDeleted: false,
    });

    // check if addresses not found in database
    if (addresses.length < 1) {
      throw createHttpError(404, "No Addresses are found yet");
    }

    // send the response
    res.status(201).json({
      status: "success",
      message: "Addresses found successfully",
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 *  @api {PATCH} /addresses/soft-delete/:addressId  soft delete address by addressId
 */
export const removeAddress = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { addressId } = req.params;

  try {
    // find address in database by id of logged in user and addressId then update isMarkedAAsDeleted state
    const address = await AddressModel.findOneAndUpdate(
      {
        _id: addressId,
        userId,
        isMarkedAsDeleted: false,
      },
      { isMarkedAsDeleted: true, isDefault: false },
      { new: true }
    );

    // check if address not found in database
    if (!address) {
      throw createHttpError(404, "Address not found");
    }

    // send the response
    res.status(201).json({
      status: "success",
      message: "Address removed successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

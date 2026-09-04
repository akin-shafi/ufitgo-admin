"use client"

import { useState, useEffect } from "react"
import { packagesService } from "../api/services/packages.service.js"

export const usePackages = () => {
  console.log("[v0] usePackages hook initializing...")

  // Packages state
  const [packages, setPackages] = useState([])
  const [packagesLoading, setPackagesLoading] = useState(true)
  const [packagesError, setPackagesError] = useState(null)

  // Metadata state
  const [packageTypes, setPackageTypes] = useState([])
  const [serviceLevels, setServiceLevels] = useState([])
  const [availableExtensions, setAvailableExtensions] = useState([])
  const [metadataLoading, setMetadataLoading] = useState(true)
  const [metadataError, setMetadataError] = useState(null)

  // Fetch packages
  const fetchPackages = async () => {
    try {
      setPackagesLoading(true)
      setPackagesError(null)
      const data = await packagesService.getAll()
      setPackages(data || [])
    } catch (err) {
      console.error("[v0] Error fetching packages:", err)
      setPackagesError(err.message || "Failed to load packages")
    } finally {
      setPackagesLoading(false)
    }
  }

  // Fetch metadata
  const fetchMetadata = async () => {
    try {
      setMetadataLoading(true)
      setMetadataError(null)

      const [typesRes, levelsRes, extensionsRes] = await Promise.all([
        packagesService.getPackageTypes(),
        packagesService.getServiceLevels(),
        packagesService.getExtensions(),
      ])

      setPackageTypes(typesRes || [])
      setServiceLevels(levelsRes || [])
      setAvailableExtensions(extensionsRes?.data || [])
    } catch (err) {
      console.error("[v0] Error fetching metadata:", err)
      setMetadataError(err.message || "Failed to load package options")
    } finally {
      setMetadataLoading(false)
    }
  }

  // AI Suggestion — now centralized
  const suggestPackageContent = async ({ name, packageType = "tour", serviceLevel = "standard" }) => {
    try {
      const res = await packagesService.suggest({ name, packageType, serviceLevel })
      return {
        description: res?.data.description?.trim() || "",
        itinerary: res?.data.itinerary?.trim() || "",
      }
    } catch  {
      console.warn("AI suggestion failed — using fallback content")
      return {
        description: `Embark on a spiritually enriching ${packageType} journey with "${name}". Enjoy comfortable accommodations, expert guidance, and culturally sensitive arrangements tailored to your needs.`,
        itinerary: `Day 1: Arrival and hotel check-in\nDay 2: Begin sacred rituals\nDay 3: Guided visits to holy sites\nDay 4: Cultural and historical exploration\nDay 5: Personal reflection and prayer\nDay 6: Final preparations and shopping\nDay 7: Departure with peace and lasting memories`,
      }
    }
  }

  // CRUD
  const createPackage = async (operatorId, packageData) => {
    const newPackage = await packagesService.createForOperator(operatorId, packageData)
    setPackages((prev) => [...prev, newPackage])
    return newPackage
  }

  const updatePackage = async (id, packageData) => {
    const updated = await packagesService.update(id, packageData)
    setPackages((prev) => prev.map((pkg) => (pkg.id === id ? updated : pkg)))
    return updated
  }

  const updateTiers = async (id, tiers) => {
    const updated = await packagesService.updateTiers(id, tiers)
    setPackages((prev) => prev.map((pkg) => (pkg.id === id ? updated.data : pkg)))
    return updated.data
  }

  const deletePackage = async (id) => {
    await packagesService.delete(id)
    setPackages((prev) => prev.filter((pkg) => pkg.id !== id))
  }


  useEffect(() => {
    fetchPackages()
    fetchMetadata()
  }, [])

  const loading = packagesLoading || metadataLoading

  return {
    packages,
    packagesLoading,
    packagesError,
    packageTypes,
    serviceLevels,
    availableExtensions,
    // suggestPackageContent,
    metadataLoading,
    metadataError,

    loading,

    fetchPackages,
    fetchMetadata,
    createPackage,
    updatePackage,
    updateTiers,
    deletePackage,
    suggestPackageContent, // ← Now properly exposed
  }
}
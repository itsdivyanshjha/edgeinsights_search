'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, User, LogOut, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { AppDispatch, RootState } from '@/store'
import { logout } from '@/store/userSlice'
import { setProducts, setSearchQuery } from '@/store/productSlice'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const suggestedKeywords = [
  'Trackpants',
  'T-shirts',
  'Wool',
  'Socks',
  'Orange',
]

interface Product {
  _id: string;
  title: string;
  images: string[];
  product_details: Array<Record<string, string>>;
  selling_price: string;
  actual_price: string;
  discount: string;
  url: string;
  category: string;
  sub_category: string;
  brand: string;
  description: string;
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { products, searchQuery } = useSelector((state: RootState) => state.product)
  const { username } = useSelector((state: RootState) => state.user)
  const [localSearchQuery, setLocalSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchProducts = async (searchTerm: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/products?category=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      
      if (!response.ok) {
        console.error('Error response:', data)
        throw new Error('Failed to fetch products')
      }
      
      console.log('Fetched products:', data)
      dispatch(setProducts(data))
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(setSearchQuery(localSearchQuery))
    await fetchProducts(localSearchQuery)
  }

  const handleKeywordClick = async (keyword: string) => {
    setLocalSearchQuery(keyword)
    dispatch(setSearchQuery(keyword))
    await fetchProducts(keyword)
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  useEffect(() => {
    if (searchQuery) {
      fetchProducts(searchQuery)
    }
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
  <div className="container mx-auto px-4 h-16 flex items-center justify-between">
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/image.png" // Make sure this path points to your logo in the 'public' folder
        alt="EdgeInsights Logo"
        width={60} // Adjust width and height as needed
        height={60}
      />
      <span className="text-xl font-bold">EdgeInsights</span>
    </Link>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-7 w-7" />
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>{username}</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</header>


      <main className="container mx-auto px-5 py-10">
        <div className={`transition-all duration-300 ease-in-out ${searchQuery ? 'mb-8' : 'my-32'}`}>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a product/category/brand..."
                className="pl-10 h-12"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
            </div>
            {!searchQuery && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {suggestedKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleKeywordClick(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </form>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : searchQuery && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product: Product) => (
              <Card key={product._id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="aspect-square relative mb-4">
                    {product.images && product.images.length > 0 && (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <ul className="space-y-2">
                    <li className="text-sm text-muted-foreground">
                      <strong>Brand:</strong> {product.brand}
                    </li>
                    <li className="text-sm text-muted-foreground">
                      <strong>Category:</strong> {product.category}
                    </li>
                    {product.product_details.slice(0, 3).map((detail, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {Object.entries(detail).map(([key, value]) => (
                          <span key={key}>
                            <strong>{key}:</strong> {value}
                          </span>
                        ))}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <div className="text-lg font-bold">₹{product.selling_price}</div>
                  <div className="text-sm text-muted-foreground">
                    <span className="line-through">₹{product.actual_price}</span> ({product.discount})
                  </div>
                  <Button asChild className="w-full">
                    <Link href={product.url} target="_blank" rel="noopener noreferrer">View on Flipkart</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center text-muted-foreground">No products found.</div>
        ) : null}
      </main>
    </div>
  )
}
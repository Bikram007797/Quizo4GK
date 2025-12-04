'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { APP_NAME, INITIAL_USER_DATA } from '@/lib/constants';

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).max(20),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 2. Update Firebase Auth profile displayName
      await updateProfile(user, { displayName: values.username });
      
      // 3. Prepare user data for Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const newUserData = {
        ...INITIAL_USER_DATA,
        id: user.uid, // CRITICAL: Set the ID to match the auth UID
        username: values.username,
        email: values.email,
      };
      
      // 4. Create user document in Firestore.
      // We will now await this to ensure the document exists before redirecting.
      await setDoc(userDocRef, newUserData);

      toast({
        title: 'Account Created!',
        description: `Welcome to ${APP_NAME}, ${values.username}!`,
      });
      router.push('/'); // Navigate on success

    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Check if it's a Firestore error
      if (error.name === 'FirebaseError' && error.code.startsWith('permission-denied')) {
         const permissionError = new FirestorePermissionError({
            path: `users/${auth.currentUser?.uid || 'unknown'}`,
            operation: 'create',
            requestResourceData: { username: values.username, email: values.email },
         });
         errorEmitter.emit('permission-error', permissionError);
      } else { // Handle Auth errors
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: error.code === 'auth/email-already-in-use' 
              ? 'This email is already in use.' 
              : 'An unexpected error occurred during sign-up.',
        });
      }
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{`Join ${APP_NAME}`}</CardTitle>
          <CardDescription>Create an account to start your quiz journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="your_username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login/" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
